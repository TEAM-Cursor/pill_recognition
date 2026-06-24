"""``POST /api/pill/identify`` 응답 스키마 (pydantic).

요청은 multipart 파일이라 본문 스키마가 없다(라우터의 UploadFile 파라미터).
응답은 use_case 의 IdentifyResult DTO 를 직렬화 가능한 형태로 변환한 것.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from apps.pill.app.dtos.identify import IdentifyResult


class AttributesSchema(BaseModel):
    shape: str | None = None
    color_front: str | None = None
    color_back: str | None = None
    imprint_front: str | None = None
    imprint_back: str | None = None
    score_line: str | None = None
    form: str | None = None


class CandidateSchema(BaseModel):
    item_seq: str
    name: str
    entp: str | None = None
    image_url: str | None = None
    confidence: float


class IdentifyResponse(BaseModel):
    attributes: AttributesSchema
    candidates: list[CandidateSchema] = Field(default_factory=list)
    needs_retry: bool = Field(
        description="후보 0개이거나 최고 신뢰도가 낮아 재촬영을 권하는지 여부",
    )
    message: str | None = Field(default=None, description="재촬영 안내 등 사용자에게 보여줄 메시지")

    @classmethod
    def from_result(cls, result: IdentifyResult, *, min_confidence: float) -> IdentifyResponse:
        attrs = result.attributes
        top = max((c.confidence for c in result.candidates), default=0.0)
        needs_retry = not result.candidates or top < min_confidence
        return cls(
            attributes=AttributesSchema(
                shape=attrs.shape.value if attrs.shape else None,
                color_front=attrs.color_front.value if attrs.color_front else None,
                color_back=attrs.color_back.value if attrs.color_back else None,
                imprint_front=attrs.imprint_front,
                imprint_back=attrs.imprint_back,
                score_line=attrs.score_line.value if attrs.score_line else None,
                form=attrs.form.value if attrs.form else None,
            ),
            candidates=[
                CandidateSchema(
                    item_seq=c.item_seq,
                    name=c.name,
                    entp=c.entp,
                    image_url=c.image_url,
                    confidence=c.confidence,
                )
                for c in result.candidates
            ],
            needs_retry=needs_retry,
            message="알약이 잘 보이도록 다시 촬영해 주세요." if needs_retry else None,
        )
