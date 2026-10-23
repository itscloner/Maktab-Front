# سامانه مدیریت خیریه مکتب طه

React 18 + TypeScript + Ant Design (RTL) + TanStack Query + React Hook Form + Zod + Axios + React Router.
همه داده‌ها از API واقعی می‌آیند؛ هیچ Mock یا داده ثابتی در پروژه نیست.

## پیش‌نیاز و اجرا
- Node.js 18 به بالا
```
npm install
cp .env.example .env     # مقدار VITE_API_BASE_URL را تنظیم کنید
npm run dev              # توسعه
npm run typecheck && npm run lint
npm run build            # خروجی در dist
```

## وضعیت راستی‌آزمایی (مهم)
فایل ZIP بدون `package-lock.json` تحویل شده و **Build، Type Check و Lint اجرا نشده‌اند**، چون محیط ساخت به اینترنت دسترسی نداشت و پکیج‌ها نصب نشدند. ارتباط زنده با Backend هم تست نشده است. پس از `npm install`، دستورهای `npm run typecheck` و `npm run build` را اجرا کنید و خطاهای احتمالی را اصلاح کنید.

## منبع قرارداد
`api.rar` فقط لایه‌ی کلاینت API (بدون کد Backend، Swagger یا Controller) و `interface.zip` فقط تایپ‌های TypeScript بودند. قرارداد از همین دو استخراج شده و در `src/api` و `src/interface` است.

## احراز هویت
- `POST User/login` با `{ userName, password }`. ساختار پاسخ در قرارداد مشخص نیست؛ `src/features/auth/extractToken.ts` فقط دو شکل را می‌پذیرد: `data` رشته توکن، یا `data.token` / `data.accessToken`. در غیر این صورت ورود با پیام خطا متوقف می‌شود. اگر Backend شکل دیگری دارد فقط همین تابع را اصلاح کنید.
- توکن با هدر `Authorization: Bearer` ارسال می‌شود و در sessionStorage نگه‌داری می‌شود (با Refresh می‌ماند، با بستن تب پاک می‌شود). پاسخ 401 باعث خروج خودکار می‌شود.
- Refresh Token و مجوزهای نقش در قرارداد نیستند؛ منوها بر اساس مجوز فیلتر نمی‌شوند.

## Endpointهای استفاده‌شده
- اشخاص: `GET/POST Perosn`، `GET/PUT/DELETE Perosn/{id}` (املای «Perosn» عیناً از قرارداد؛ DELETE در قرارداد «استنباط‌شده» علامت خورده و باید تأیید شود)
- درخواست‌ها: `GET/POST Request`، `GET/PUT Request/{id}`، `POST Request/approve`
- پرونده‌ها: `GET/POST Case`، `GET/PUT/DELETE Case/{id}`، `POST CasePerson`
- اطلاعات پایه: Province، City/{provinceId}، Religon، Nationality، Area، RequestType، HouseHeadStatus، RequestStatus، Gender، PrivatenessStatus، CaseType، Bank، Job، Skill، MaritalStatus، EducationalStatus، EducationLevel، DependancyStatus، OrphanStatus، PhysicalStatus، EmploymentStatus، UnemploymentReason
- تأیید درخواست: پارامترهای `Id, RequestStatusId, StatusReason, ApproveDate, OfficerDescription` در Query و فایل در فیلد `Attachment` به‌صورت multipart. نام پارامترها از جدول دستور پروژه گرفته شده (کامنت قرارداد به‌جای RequestStatusId نوشته `status`)؛ در صورت تفاوت، `src/api/request/_request.ts` را اصلاح کنید.

## شکاف‌های قرارداد و تصمیم‌ها
- **کاربران و نقش‌ها**: هیچ Endpoint ای (جز login) در قرارداد نیست. ماژول کاربران کامل ساخته شده ولی مسیرها از `VITE_USERS_ENDPOINT` و `VITE_ROLES_ENDPOINT` خوانده می‌شوند؛ تا تنظیم نشوند صفحه پیام «تعریف نشده» نشان می‌دهد. الگوی REST استاندارد فرض شده و باید تأیید شود.
- **Pagination و جست‌وجوی سمت سرور**: در قرارداد پارامتر صفحه‌بندی نیست؛ جدول‌ها صفحه‌بندی سمت کلاینت دارند. فیلتر سمت سرور فقط برای درخواست‌ها (`IFilterRequest`) و پرونده‌ها (`ICaseFilter`) است؛ جست‌وجوی اشخاص و کاربران روی داده بارگذاری‌شده انجام می‌شود.
- **فیلدهای بدون فهرست پایه**: معرف (`refererId`/`referrerId`)، مرحله پرونده (`caseStageId`)، نسبت (`relationId`) و `sadatStatusId` Endpoint ای ندارند و به‌صورت ورودی عددی هستند.
- **جنسیت درخواست**: هنگام ثبت/ویرایش، `genderId` (شناسه‌ی گزینه‌ی Gender) به Backend ارسال می‌شود. در فهرست، متن `gender` نمایش داده می‌شود؛ اگر پاسخ فهرست `genderId` نداشته باشد، شناسه در فرم ویرایش از روی تطبیق متن با فهرست Gender پیدا می‌شود.
- **شکل پاسخ فهرست‌های پایه**: فیلد `title` (یا `name`) و `id` انتظار می‌رود.
- **شماره پرونده**: کاربر وارد نمی‌کند و در ایجاد ارسال نمی‌شود. پس از ثبت، شماره از پاسخ ایجاد (`caseNumber`) یا با دریافت مجدد پرونده (از روی شناسه‌ی پاسخ) نمایش داده می‌شود. اگر Backend بدون `caseNumber` خطای «الزامی» داد، در `createCaseWithMembers` مقدار خالی ارسال شود.
- **ایجاد پرونده**: اشخاص در همان درخواست و در `personsInCase` (`personId`، `relationId`، `isDependent` به‌صورت ۰/۱) ارسال می‌شوند. در ویرایش، اشخاص جدید با `POST CasePerson` اضافه می‌شوند.
- **تاریخ شمسی**: همه‌ی تاریخ‌ها را کاربر شمسی انتخاب می‌کند (`JalaliDatePicker`، تبدیل بدون وابستگی و تست‌شده با تقویم Intl)، ولی مقدار ISO میلادی ذخیره و ارسال می‌شود. فیلدهای بدون ساعت ساعت ۱۲:۰۰ می‌گیرند تا تغییر منطقه زمانی روز را عوض نکند.
- **ویرایش**: فرم‌های اشخاص، درخواست‌ها و پرونده‌ها رکورد کامل را از سرور می‌خوانند و همه‌ی مقادیر ثبت‌شده را پیش‌فرض می‌گذارند.
- **اشخاص پرونده**: فقط `POST CasePerson` وجود دارد (فیلد `Personal` عیناً مطابق قرارداد). ایجاد پرونده ابتدا `POST Case` و سپس ثبت ترتیبی هر شخص است؛ شناسه پرونده باید در پاسخ باشد، وگرنه پیام هشدار نشان داده می‌شود. در ویرایش، فقط اشخاص جدید اضافه می‌شوند و اعضای قبلی فقط‌خواندنی‌اند. ساختار `personsInCase` دستور پروژه در قرارداد واقعی وجود نداشت.
- **پیوست پرونده**: Endpoint بارگذاری/دریافت ندارد؛ فقط نمایش می‌شود. دانلود پیوست درخواست فقط وقتی لینک http است نمایش داده می‌شود.
- **تاریخ**: نمایش شمسی؛ ورودی DatePicker میلادی/ISO است (بدون وابستگی اضافی).
- **قواعد گردش کار** (ممنوعیت ویرایش پس از تأیید و …) در قرارداد نیست؛ خطاهای سرور نمایش داده می‌شوند.
- **داشبورد**: Endpoint آمار نیست؛ شمارش‌ها از طول فهرست‌های واقعی محاسبه می‌شوند.
- لایه API ارسالی خطاها را برمی‌گرداند (`return error.response`)؛ برای جلوگیری از پیام موفقیت کاذب، همه درخواست‌ها بازنویسی شدند تا در خطا پرتاب کنند. کلید Query تکراری فایل اصلی (`city`، `housing`) هم اصلاح شد.

## رابط کاربری
- تم ساده بنفش/نیلی با عمق ملایم، بدون انیمیشن سنگین؛ منوی دوسطحی (گروه ← زیرمنو) که در موبایل به Drawer تبدیل می‌شود.
- زیرمنوهای «ثبت جدید» با `?new=1` فرم مربوط را باز می‌کنند. همه Drawerها از چپ باز می‌شوند و در موبایل تمام‌عرض‌اند.
- برچسب گزینه‌های اطلاعات پایه از `title`/`name` یا هر فیلدی که با `Name`/`Title` تمام شود (مثل `genderName`، `areaName`، `bankName`، `caseTypeName`) خوانده می‌شود: `lookupLabel` در `src/utils/format.ts`.
