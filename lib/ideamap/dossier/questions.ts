import type { TriText } from "./schema";

// The canonical 30-question INDH project fiche (identification, porteur
// profile, market/positioning, beneficiaries/impact, financing,
// sustainability). This is the SINGLE source of truth for the holder's
// guided dialogue (HolderApp's BUILTIN_FIXED_Q in app/ideamap/page.tsx
// re-exports this array rather than declaring its own copy) and for the
// Dossier Factory's bulk-import flow, which uses it to know what a complete
// dossier is expected to cover even when the only source is a committee
// Excel row.
//
// A coordinator's own uploaded questionnaire (CoordQuestion[], parsed via
// /api/parse-questionnaire) always takes precedence over this set for a
// given holder — see `usingCustomQ` in HolderApp. This array is the default
// every holder gets absent that override.
export const HOLDER_QUESTIONS: TriText[] = [
  {fr: "Quel est le nom (ou l'enseigne) de votre projet ?", ar: "ما هو اسم مشروعك (أو علامته التجارية)؟", en: "What is the name (or brand) of your project?"},
  {fr: "Dans quel secteur d'activité se situe votre projet ?", ar: "في أي قطاع نشاط يندرج مشروعك؟", en: "What sector does your project belong to?"},
  {fr: "Dans quelle ville, quartier ou douar sera-t-il implanté ?", ar: "في أي مدينة أو حي أو دوار سيقام مشروعك؟", en: "In which city, neighborhood, or village will it be located?"},
  {fr: "Décrivez en une phrase le concept de votre projet.", ar: "صف فكرة مشروعك في جملة واحدة.", en: "Describe your project's concept in one sentence."},
  {fr: "Quels produits ou services allez-vous proposer ?", ar: "ما هي المنتجات أو الخدمات التي ستقدمها؟", en: "What products or services will you offer?"},
  {fr: "Quelle est votre expérience dans ce domaine ?", ar: "ما هي خبرتك في هذا المجال؟", en: "What is your experience in this field?"},
  {fr: "Quelle formation ou compétence spécifique possédez-vous ?", ar: "ما هو التكوين أو المهارة الخاصة التي تمتلكها؟", en: "What specific training or skill do you have?"},
  {fr: "Avez-vous déjà une clientèle ou des contacts prêts à vous suivre ?", ar: "هل لديك زبائن أو معارف مستعدون لمتابعتك؟", en: "Do you already have clients or contacts ready to follow you?"},
  {fr: "Qui va bénéficier directement de votre projet ?", ar: "من سيستفيد مباشرة من مشروعك؟", en: "Who will directly benefit from your project?"},
  {fr: "Combien de personnes seront bénéficiaires directes ?", ar: "كم عدد المستفيدين المباشرين؟", en: "How many people will be direct beneficiaries?"},
  {fr: "Quel problème local concret votre projet résout-il ?", ar: "ما هي المشكلة المحلية الملموسة التي يحلها مشروعك؟", en: "What concrete local problem does your project solve?"},
  {fr: "Qui sont vos principaux concurrents dans la zone ?", ar: "من هم أهم منافسيك في المنطقة؟", en: "Who are your main competitors in the area?"},
  {fr: "Qu'est-ce qui vous différencie de la concurrence ?", ar: "ما الذي يميزك عن المنافسين؟", en: "What sets you apart from the competition?"},
  {fr: "Comment allez-vous fixer vos prix ?", ar: "كيف ستحدد أسعارك؟", en: "How will you set your prices?"},
  {fr: "Comment allez-vous attirer et fidéliser vos clients ?", ar: "كيف ستجذب زبائنك وتحافظ عليهم؟", en: "How will you attract and retain customers?"},
  {fr: "Comment allez-vous vendre et générer des revenus ?", ar: "كيف ستبيع وتحقق دخلاً؟", en: "How will you sell and generate revenue?"},
  {fr: "Quel volume de clients ou de ventes visez-vous par semaine ?", ar: "ما هو حجم الزبائن أو المبيعات المستهدف أسبوعياً؟", en: "What sales/customer volume are you targeting per week?"},
  {fr: "Quel équipement principal souhaitez-vous acquérir avec l'appui INDH ?", ar: "ما هو التجهيز الرئيسي الذي تريد اقتناءه بدعم المبادرة الوطنية؟", en: "What main equipment do you want to acquire with INDH support?"},
  {fr: "Quel est le coût total estimé de votre projet ?", ar: "ما هي الكلفة الإجمالية المقدرة لمشروعك؟", en: "What is the total estimated cost of your project?"},
  {fr: "Quelle part pouvez-vous apporter vous-même (10%) ?", ar: "كم يمكنك أن تساهم بنفسك (10%)؟", en: "How much can you contribute yourself (10%)?"},
  {fr: "Quel chiffre d'affaires visez-vous la première année ?", ar: "ما هو رقم المعاملات الذي تستهدفه في السنة الأولى؟", en: "What revenue are you targeting for year one?"},
  {fr: "Combien d'emplois directs votre projet va-t-il créer ?", ar: "كم من فرصة شغل مباشرة سيخلقها مشروعك؟", en: "How many direct jobs will your project create?"},
  {fr: "Quel est l'impact social attendu au-delà des emplois ?", ar: "ما هو الأثر الاجتماعي المتوقع بخلاف فرص الشغل؟", en: "What social impact do you expect beyond jobs?"},
  {fr: "Comment votre projet contribuera-t-il à la vie du quartier ou du douar ?", ar: "كيف سيساهم مشروعك في حياة الحي أو الدوار؟", en: "How will your project contribute to the neighborhood or village?"},
  {fr: "Combien de clients par jour faut-il pour couvrir vos charges (seuil de rentabilité) ?", ar: "كم عدد الزبائن يومياً لتغطية مصاريفك (عتبة الربحية)؟", en: "How many customers per day do you need to cover your costs (break-even)?"},
  {fr: "Comment votre projet continuera-t-il après la fin de l'appui INDH ?", ar: "كيف سيستمر مشروعك في العمل بعد انتهاء دعم المبادرة الوطنية؟", en: "How will your project keep running after INDH support ends?"},
  {fr: "Quel est le principal risque qui pourrait freiner votre projet ?", ar: "ما هو أكبر خطر قد يعرقل مشروعك؟", en: "What is the main risk that could hold your project back?"},
  {fr: "Comment comptez-vous faire face à ce risque ?", ar: "كيف تنوي مواجهة هذا الخطر؟", en: "How do you plan to handle that risk?"},
  {fr: "Avez-vous un plan pour faire grandir le projet dans les prochaines années ?", ar: "هل لديك خطة لتطوير المشروع في السنوات القادمة؟", en: "Do you have a plan to grow the project in the coming years?"},
  {fr: "Pourquoi le jury INDH devrait-il choisir votre projet ?", ar: "لماذا يجب على لجنة المبادرة الوطنية اختيار مشروعك؟", en: "Why should the INDH jury choose your project?"},
];
