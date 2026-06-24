/* 백엔드 API 클라이언트.
   현재 쓰는 엔드포인트: POST /api/pill/identify (사진 → 속성 추출 + 후보 약).
   서버에 GOOGLE_API_KEY 가 없으면 백엔드가 fake Vision 으로 응답하므로,
   키 발급 전에도 이 경로로 흐름 전체를 확인할 수 있다. */

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

/** Vision 이 추출한 식별 속성(식약처 표기). 모르는 값은 null. */
export interface IdentifiedAttributes {
  shape: string | null
  color_front: string | null
  color_back: string | null
  imprint_front: string | null
  imprint_back: string | null
  line_front: string | null
  line_back: string | null
  form: string | null
}

/** 매칭 후보 약 한 건 (score 높을수록 일치). */
export interface PillCandidate {
  item_seq: string
  item_name: string
  entp_name: string | null
  shape: string | null
  color_front: string | null
  color_back: string | null
  print_front: string | null
  print_back: string | null
  image_url: string | null
  is_otc: boolean | null
  score: number
}

export interface IdentifyResponse {
  attributes: IdentifiedAttributes
  candidates: PillCandidate[]
  /** 후보 0개이거나 최고 점수가 낮아 재촬영을 권하는지. */
  needs_retry: boolean
  /** 재촬영 안내 등 사용자에게 보여줄 메시지. */
  message: string | null
}

/** API 호출 실패. status=0 은 네트워크 단절(서버 미기동 등). */
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** 알약 사진을 보내 식별 결과를 받는다. file 은 카메라 캡처 Blob 또는 업로드 File. */
export async function identifyPill(file: Blob): Promise<IdentifyResponse> {
  const form = new FormData()
  form.append('file', file, 'pill.jpg')

  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/pill/identify`, { method: 'POST', body: form })
  } catch {
    throw new ApiError(0, '서버에 연결할 수 없어요. 백엔드가 실행 중인지 확인해 주세요.')
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null
    throw new ApiError(res.status, body?.detail ?? `요청 실패 (${res.status})`)
  }
  return (await res.json()) as IdentifyResponse
}
