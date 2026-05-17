"""
KB국민카드 엑셀 → finance_app DB 임포터

사용법:
  1. 이 파일과 같은 폴더에 엑셀 파일을 넣고 FILE_NAME을 맞게 수정
  2. DB_PASSWORD를 본인 PostgreSQL 비밀번호로 수정
  3. USER_ID를 본인 Firebase UID로 수정
  4. python import_kb.py 실행
"""

import pandas as pd
import psycopg2

# ── 설정 (실행 전 반드시 수정) ────────────────────────
FILE_NAME = 'Expense_record.xls'      # 엑셀 파일명
DB_PASSWORD = '984712'  # PostgreSQL 비밀번호
USER_ID = 'KARdoeN4yDPe2gcyFX5Ar5MoKfv1'  # Firebase UID (앱 로그인 후 DB에서 확인)
# ──────────────────────────────────────────────────────


# ── 가맹점명 → (category, icon) 매핑 ──────────────────
def map_category(merchant):
    m = str(merchant)

    coffee_kw    = ['스타벅스', '투썸', '커피', '카페', '이디야', '빽다방', '메가커피', '할리스', 'coffee']
    food_kw      = ['맥도날드', '버거킹', '롯데리아', '피자', '치킨', '한솥', '김밥', '식당', '고기',
                    '삼겹', '중화', '일식', '분식', '도시락', '편의점', 'cu', 'gs25', '세븐일레븐', '미니스톱', '이마트24']
    transport_kw = ['지하철', '버스', '택시', '카카오t', 'ktx', 'korail', 'tmoney', 'T머니']
    shopping_kw  = ['올리브영', '다이소', '쿠팡', '무신사', '지그재그', '쇼핑', 'h&m', 'zara',
                    '아디다스', '나이키', '유니클로', '스파오', '이케아']

    for kw in coffee_kw:
        if kw.lower() in m.lower():
            return ('커피', 'coffee')
    for kw in food_kw:
        if kw.lower() in m.lower():
            return ('식사', 'food')
    for kw in transport_kw:
        if kw.lower() in m.lower():
            return ('교통비', 'transport')
    for kw in shopping_kw:
        if kw.lower() in m.lower():
            return ('쇼핑', 'shopping')

    return ('기타', 'food')


# ── 엑셀 읽기 ──────────────────────────────────────────
print(f'📂 {FILE_NAME} 읽는 중...')
df = pd.read_excel(FILE_NAME, skiprows=6)  # 1~6행은 메타정보, 7행이 헤더

# 컬럼명 정리 (공백 및 줄바꿈 제거)
df.columns = df.columns.str.strip().str.replace('\n', '')

print(f'✅ 총 {len(df)}건 로드')
print(f'컬럼 목록: {list(df.columns)}\n')

print('상태 컬럼 값 샘플:', df['상태'].unique())

# ── 데이터 정제 ────────────────────────────────────────
# 취소 건 제외
df = df[df['상태'].astype(str).str.strip() == '전표매입']
print(f'✅ 정상 거래만 필터링: {len(df)}건')

# 해외 결제 제외 (국내이용금액이 있는 것만)
df = df[df['국내이용금액(원)'].notna() & (df['국내이용금액(원)'] != 0)]
print(f'✅ 국내 결제만 필터링: {len(df)}건\n')

# ── DB 연결 ────────────────────────────────────────────
print('🔌 DB 연결 중...')
conn = psycopg2.connect(
    host='localhost',
    port=5432,
    database='finance_app',
    user='postgres',
    password=DB_PASSWORD
)
cursor = conn.cursor()
print('✅ DB 연결 성공\n')

# ── 데이터 삽입 ────────────────────────────────────────
success = 0
skip    = 0

for _, row in df.iterrows():
    try:
        merchant = str(row['이용하신곳']).strip()
        amount   = int(row['국내이용금액(원)'])
        time_val = str(row['이용시간']).strip()[:5]   # '09:30:00' → '09:30'
        hour     = int(time_val.split(':')[0]) if ':' in time_val else 0
        period   = '오전' if hour < 12 else '오후'

        category, icon = map_category(merchant)

        cursor.execute("""
            INSERT INTO spending (category, amount, icon, time, period, user_id, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (category, amount, icon, time_val, period, USER_ID, row['이용일']))

        success += 1

    except Exception as e:
        print(f'⚠️  스킵: {row.get("이용하신곳", "?")} - {e}')
        skip += 1

conn.commit()
cursor.close()
conn.close()

print(f'\n🎉 완료!')
print(f'   성공: {success}건')
print(f'   스킵: {skip}건')
