# Сводка валидных находок

Дата: 2026-04-26

Источники:

- предыдущая консолидация Codex/Gemini
- `code-review/CLAUDE.md`

## Подтвержденные дефекты

### 1. Неверные `notes` в ручных датасетах аккордов

Статус: ✅ выполнено. Исправлены ручные `notes` в `chords-basic` и `chords-extended`.

Файлы:

- `src/data/chords-basic.ts:7`
- `src/data/chords-extended.ts:7`
- `src/data/chords-extended.ts:12`
- `src/data/chords-extended.ts:35`

Проблема: часть `notes` не соответствует фактическим звукам из `frets` при стандартном строе `E2 A2 D3 G3 B3 E4`.

Подтвержденные расхождения:

- `C` barre `[x,3,5,5,5,3]`: последняя нота должна быть `G4`, сейчас `C5`.
- `Csus2` `[x,3,0,0,1,3]`: последняя нота должна быть `G4`, сейчас `D4`.
- `Em7` `[0,2,0,0,0,0]`: третья нота должна быть `D3`, сейчас `E3`.

Влияние: диаграмма может быть визуально правильной, но аудио воспроизводит другую ноту или гармонию.

### 2. Изменение настроек сбрасывает состояние активной фичи

Статус: ✅ выполнено. Feature views теперь обновляются через `refresh()` без teardown/mount; смена chord set синхронизирует state явно.

Файлы:

- `src/app.ts:73`
- `src/app.ts:87`
- `src/features/chord-quiz/index.ts:19`
- `src/features/chord-quiz/view.ts:53`
- `src/features/chord-browse/index.ts:19`
- `src/features/chord-browse/view.ts:31`

Проблема: общий subscriber настроек вызывает `active.onContextChange`, а `chordQuiz.onContextChange` и `chordBrowse.onContextChange` полностью размонтируют и монтируют view заново. Новый mount создает новый случайный `QuizState`; browse возвращается к `{ selectedRoot: null, typeIdx: 0, shapeIdx: 0 }`.

Влияние: переключение `hideDiagram`, языка, темы или chord set может неожиданно сменить текущий аккорд в квизе и сбросить выбранный аккорд в browse. Это также срабатывает при первичном `activate()`, потому что `settings.set({ lastFeatureId: next.id })` запускает тот же subscriber.

Рекомендация: не пересоздавать view при каждом изменении настроек; обновлять UI без потери состояния или перемонтировать только при смене chord set. Для `lastFeatureId`, темы и языка нужен отдельный путь без teardown/mount.

### 3. Тесты данных не проверяют соответствие `frets` и `notes`

Статус: ✅ выполнено. Добавлен общий test helper, который вычисляет ноты из стандартного строя и сравнивает их с `shape.notes`.

Файлы:

- `src/shared/lib/chord.ts:40`
- `src/data/chords-basic.test.ts:6`
- `src/data/chords-extended.test.ts:6`
- `src/data/chords-all.test.ts:6`

Проблема: `validateChordShape` проверяет форму данных, но не вычисляет ожидаемые ноты из строя и ладов. Поэтому неверные `notes` проходят тесты.

Рекомендация: добавить тестовый helper, который вычисляет ноты из стандартного строя и `frets`, затем сравнивает результат с `shape.notes`.

### 4. `html[lang]` не синхронизируется при смене языка

Статус: ✅ выполнено. `document.documentElement.lang` выставляется при старте и при изменении настроек языка.

Файлы:

- `index.html:2`
- `src/app.ts:79`

Проблема: документ стартует с `lang="ru"`, но при переключении на `en` или `uk` меняется только i18n-состояние приложения.

Влияние: хуже работают screen reader, автоперевод и браузерные языковые эвристики.

Рекомендация: при инициализации и смене языка выставлять `document.documentElement.lang = settings.lang`.

### 5. Управление табами, root-rail и фокусом неполноценно для доступности

Статус: ✅ выполнено. Добавлены `<main>`, `aria-current`, tablist/tab-семантика root picker, клавиатурная навигация и восстановление фокуса после пересборки повторных кнопок.

Файлы:

- `src/shared/components/TabBar.ts:17`
- `src/shared/components/TabBar.ts:23`
- `src/features/chord-browse/view.ts:28`
- `src/shared/components/RootTile.ts:7`
- `src/shared/components/AppShell.ts:15`
- `src/app.ts:67`
- `src/shared/components/ChordCard.ts:66`
- `src/shared/components/ChordCard.ts:76`
- `src/features/chord-browse/view.ts:53`

Проблемы:

- `TabBar` рендерит обычный `<nav>` с кнопками, но активная вкладка отмечена только классом. Скринридер не получает `aria-current` или tab-семантику.
- `root-rail` объявлен как `role="tablist"`, но `RootTile` не получает `role="tab"` и `aria-selected`; активность выражена через `aria-pressed`, что относится к toggle-кнопкам.
- Shell не создает `<main>` для основного контента.
- `replaceChildren()` при смене фичи, root tile, type/shape rows уничтожает DOM-узлы и может сбрасывать фокус на `<body>`.

Рекомендация: выбрать единый ARIA-паттерн для навигации и root picker, добавить `<main>` для content slot, а для повторных кнопок обновлять существующие элементы по id вместо полного пересоздания.

### 6. Подпись переключателя "скрывать схему" не кликабельна

Статус: ✅ выполнено. Подпись переключателя заменена на связанный `<label>`.

Файл: `src/features/chord-quiz/view.ts:21`

Проблема: текстовая подпись сделана обычным `<span>`, а переключается только сам `button`-switch. На мобильном это уменьшает интерактивную область и расходится с привычным поведением label + switch.

Рекомендация: связать подпись и switch через `<label>`/`aria-labelledby` или сделать кликабельную обертку, которая делегирует переключение кнопке.

## Валидные низкоприоритетные наблюдения

### 7. Аудио намеренно обрывает активные голоса перед новым аккордом

Файл: `src/shared/services/audio.ts:41`

Код вызывает `s.releaseAll()` перед каждым новым аккордом. Это не текущий баг: рядом есть комментарий, что так предотвращается исчерпание polyphony. Но это валидный UX-трейдофф, если нужен естественный overlap между быстрыми аккордами. Также `maxPolyphony = 64` становится менее значимым при обязательном `releaseAll()`.

Рекомендация: рассматривать только после исправления данных и состояния квиза. Возможный путь - короткий fade/release или отдельная стратегия voice limiting.

### 8. Документация и Workbox-конфиг упоминают CDN/Tone.js, хотя Tone.js бандлится

Статус: ✅ выполнено. Убран runtime cache для `cdnjs`, удален лишний `woff2` из precache glob, актуальная architecture spec обновлена под npm-bundle Tone.js.

Файлы:

- `docs/superpowers/specs/2026-04-25-architecture-design.md:242`
- `vite.config.ts:34`
- `vite.config.ts:23`
- `src/shared/services/audio.ts:1`
- `package.json:15`

Gemini сформулировал это как offline-риск, но текущий код импортирует `tone` из npm, и Vite включает его в production bundle. Поэтому offline-риск по Tone.js не подтвержден.

Валидная часть: архитектурная документация и runtime caching для `cdnjs` выглядят устаревшими или лишними относительно текущей реализации. `globPatterns` также включает `woff2`, хотя шрифты сейчас подключаются внешне и не попадают в `dist`.

### 9. Внешние Google Fonts не precache'ятся для первого offline-запуска

Файлы:

- `index.html:26`
- `index.html:28`
- `vite.config.ts:26`
- `public/manifest.webmanifest:4`

Проблема: приложение заявлено как offline-capable, но Spectral и IBM Plex Mono загружаются с Google Fonts. Workbox runtime cache поможет только после успешной online-загрузки этих URL; при первом запуске без сети UI уйдет на fallback-шрифты.

Это не ломает основную функциональность, но это валидный offline-polish риск для PWA.

Рекомендация: self-host `.woff2` в `public/fonts` и подключить через `@font-face`, либо принять системные шрифты как основной offline-дизайн.

### 10. `ChordCard` содержит устаревший комментарий про browse

Статус: ✅ выполнено. Комментарий переписан без неверного утверждения про browse.

Файл: `src/shared/components/ChordCard.ts:62`

Комментарий говорит, что в browse `data.types` всегда пустой и type-row отсутствует. Текущий browse передает список типов в `src/features/chord-browse/view.ts:85`, поэтому row отображается. Это не runtime-баг, но комментарий вводит в заблуждение при сопровождении.

Рекомендация: удалить или переписать комментарий.

### 11. Размеры отдельных файлов превышают локальные правила

Файлы:

- `src/styles/global.css` - 739 строк
- `src/data/chords-all.ts` - 894 строки

Правила репозитория задают target до 300 строк и split before 500. Для `chords-all.ts` смягчающий фактор - файл сгенерирован, но текущее состояние все равно усложняет ревью и сопровождение.

Рекомендация: дробить CSS по компонентным файлам, а сгенерированный `chords-all` разбить по root или вынести в отдельный generated-пакет с barrel export.

### 12. Горизонтальные pill-rows скрывают overflow без affordance

Статус: ✅ выполнено. Для горизонтальных рядов добавлен edge fade, а type/shape button row теперь остается nowrap и скроллится явно.

Файлы:

- `src/styles/global.css:391`
- `src/styles/global.css:400`
- `src/styles/global.css:403`
- `src/shared/lib/chord.ts:3`

В наборе `all` у root может быть до 18 типов аккордов. Row допускает горизонтальный overflow и скрывает scrollbar, поэтому на мобильном неочевидно, что справа есть дополнительные варианты.

Рекомендация: добавить edge fade/scroll indicator или заменить на отдельный компактный picker для большого набора типов.

### 13. SVG-подписи в диаграмме зависят от шрифта и магических `y`-смещений

Статус: ✅ выполнено. SVG-текст переведен на `dominant-baseline="central"` вместо ручных `+4`/`-4` baseline-смещений.

Файл: `src/shared/components/FretboardDiagram.ts:34`

Muted/open markers и цифры пальцев позиционируются через фиксированные `y - 12`, `y - 4`, `y + 4` и `font-family="var(--font-mono)"`. При fallback-шрифтах или разных webview это может давать небольшие сдвиги.

Рекомендация: использовать SVG baseline-атрибуты (`dominant-baseline`, `alignment-baseline`) и/или CSS-классы вместо ручных offsets.

### 14. Мертвые или чрезмерно локализованные i18n-ключи

Статус: ✅ выполнено. Удалены неиспользуемые `chord.type.`/`quiz.label.type`, а одинаковые `app.title.suffix` и `shape.recommended` вынесены из словарей в кодовые константы.

Файлы:

- `src/shared/services/i18n/ru.ts:27`
- `src/shared/services/i18n/en.ts:27`
- `src/shared/services/i18n/uk.ts:27`
- `src/shared/services/i18n/ru.ts:25`

`chord.type.` для major сейчас не используется, потому что views для major передают пустой `metaText`. `shape.recommended` и `app.title.suffix` во всех словарях одинаковые символы. Это не дефект поведения, но cleanup валиден.

Рекомендация: либо показывать major-подпись и оставить ключ, либо удалить мертвый ключ; одинаковые символы можно вынести из словарей.

## Отклоненные пункты Gemini

- Leaky subscriptions в feature views: не подтверждено. Сейчас views не подписываются на `settings`/`i18n`; подписки живут на уровне приложения.
- `destroy()` для DOM-компонентов: не подтверждено как дефект. Локальные event listeners удаляются вместе с DOM-узлами; внешних ресурсов компоненты не держат.
- Auto-play в Quiz: продуктовая идея, не дефект без явного требования.
- Empty translation key для major chords: не подтверждено. В текущих views для major используется пустой `metaText`; неиспользуемый `chord.type.` удален как cleanup.
- Animation race в `ChordCard`: не подтверждено по текущему коду; `cancelExit` снимает ожидающий `animationend`, а быстрый повторный render заменяет содержимое.

## Отклоненные или не включенные пункты Claude

- Animation race при смене типа/формы: не подтверждено в заявленном виде. `ChordCard` запускает exit/enter только при изменении `hidden`, а не при обычной смене type/shape.
- `ChordCard` как `<div role="button">`: текущая реализация обрабатывает Enter/Space и не содержит вложенной кнопки в активном состоянии, поэтому это скорее стиль реализации, чем дефект.
- `CHORDS_ALL` voicing/inversion concerns: музыкально спорно, но не является техническим дефектом. Инверсии, дублирующиеся ноты и частичные баррэ могут быть допустимыми voicing'ами; нужна отдельная продуктовая политика курации advanced-набора.
- `pickRandom` пересчитывает flat-массив: с текущим размером данных это незначительная оптимизация.
- `TopBar` через `innerHTML` с `escapeHtml`: поведение безопасно из-за escaping; можно упростить DOM-сборкой, но это не дефект.
- Дублирование bootstrap-логики темы в `index.html`: maintenance-замечание, но без текущего поведенческого риска.
- Поддержка старых WebView для CSS variables внутри SVG: не включено без явного требования поддерживать такие webview.
