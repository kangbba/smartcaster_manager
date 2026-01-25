# Development Conventions

> **중요**: 이 프로젝트는 **일관성**을 최우선으로 합니다. 새로운 기능을 추가할 때 기존 패턴을 반드시 따라야 합니다.

## 🎨 Slide Rendering

### ✅ DO
- **항상** `<SlideThumbnail>` 컴포넌트 사용
- 슬라이드 미리보기가 필요한 모든 곳에서 동일한 렌더링 로직 사용
```tsx
<SlideThumbnail slide={slide} media={media} />
```

### ❌ DON'T
- 슬라이드를 수동으로 렌더링 (inline styles, 하드코딩된 fontSize 등)
- `slide.fontSize`를 직접 사용 (반드시 `getScaledFontSize()` 사용)
- `slide.text`를 직접 배치 (반드시 `getTextRenderStyle()` 사용)

**위치**: `app/components/SlideThumbnail.tsx`

---

## 🎬 Animation System

### ✅ DO
- 새 애니메이션 추가 시: `lib/animation-specs.ts`의 `AnimationType`에 추가
- UI에서 애니메이션 선택 시: `AnimationPicker` + `AnimationDetailControls` 사용
- 이미지와 텍스트 모두 동일한 애니메이션 시스템 사용

```tsx
<AnimationPicker
  value={(slide.mediaAnimation as AnimationType) || "none"}
  onChange={(value) => {
    const config = getDefaultAnimationConfig(value, slide.duration);
    onUpdate({ mediaAnimation: value, ...config });
  }}
/>
```

### ❌ DON'T
- 커스텀 애니메이션 로직 직접 구현
- 애니메이션 타입을 하드코딩
- 이미지와 텍스트에 다른 애니메이션 시스템 사용

**위치**:
- `lib/animation-specs.ts` - 애니메이션 로직
- `app/components/AnimationPicker.tsx` - UI 컴포넌트
- `lib/utils/slidePreview.ts` - 렌더링 적용

---

## 🗄️ Data Mapping

### ✅ DO
- Supabase → App 데이터 변환 시: `lib/data/mappers.ts` 사용
```tsx
import { mapDbMediaToMediaFile, mapDbSlideToSlide } from "@/lib/data/mappers";

const media = mapDbMediaToMediaFile(mediaRow);
const slide = mapDbSlideToSlide(slideRow);
```

### ❌ DON'T
- 데이터 변환 로직 직접 작성
- MediaRow를 MediaFile 대신 직접 사용

**위치**: `lib/data/mappers.ts`

---

## 🎯 Core Architecture Patterns

### Slide 데이터 일관성
- **Single Source of Truth**: Slide 타입은 `lib/types/index.ts`에만 정의
- **Resolution-based Scaling**: 모든 크기 계산은 `resolutionWidth/Height` 기준
- **Animation State**: 항상 `calculateAnimationState()` 사용

### Component Reusability
- 공통 로직은 항상 별도 컴포넌트/함수로 분리
- 3회 이상 반복되는 코드는 리팩토링 대상

### Database Operations
- 직접 supabase 쿼리 작성 금지
- 데이터 CRUD는 `lib/data/` 디렉토리 함수 사용

---

## 📁 File Organization

```
lib/
  ├── animation-specs.ts       # 애니메이션 로직 (확장 가능)
  ├── types/index.ts            # 타입 정의
  ├── data/
  │   ├── mappers.ts           # DB ↔ App 데이터 변환
  │   └── ...Store.ts          # 상태 관리
  └── utils/
      ├── slidePreview.ts      # 슬라이드 렌더링 계산
      └── ...

app/components/
  ├── SlideThumbnail.tsx       # 슬라이드 썸네일 (재사용)
  ├── AnimationPicker.tsx      # 애니메이션 UI (재사용)
  ├── SlideElementPanels.tsx   # 속성 편집 패널
  └── ...
```

---

## 🚨 Common Mistakes

1. **썸네일 불일치**: SlideThumbnail 대신 수동 렌더링
2. **타입 불일치**: MediaRow와 MediaFile 혼용
3. **애니메이션 중복**: 기존 AnimationType 확인 없이 새 로직 작성
4. **스케일링 무시**: fontSize 직접 사용, 해상도 무시

---

## ✨ Adding New Features

### 새 애니메이션 추가 예시
1. `lib/animation-specs.ts`에 타입 추가
2. `ANIMATION_SPECS`에 계산 로직 추가
3. **끝** - UI는 자동으로 새 애니메이션 표시

### 새 슬라이드 속성 추가 예시
1. `lib/types/index.ts`의 `Slide` 타입에 추가
2. `SlideElementPanels.tsx`에 UI 추가
3. `lib/utils/slidePreview.ts`에 렌더링 로직 추가
4. **일관성 확인**: 모든 썸네일에 즉시 반영됨

---

**Last Updated**: 2026-01-25
