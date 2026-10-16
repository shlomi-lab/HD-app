# Helpdesk כיס

אפליקציית PWA אישית לתקלות IT. עובדת אופליין לגמרי אחרי הטעינה הראשונה, בלי שרת ובלי התחברות.
הנתונים נשמרים בטלפון (IndexedDB).

## העלאה ל-GitHub Pages (חינם, נותן HTTPS שנדרש ל-iPhone)

1. ב-GitHub צור repository חדש, למשל `helpdesk-pocket` (אפשר Private אם יש לך חשבון שמאפשר Pages ב-Private, אחרת Public).
2. העלה את כל הקבצים מהתיקייה הזו לשורש ה-repository (`index.html` חייב להיות בשורש).
   - בדפדפן: Add file ← Upload files ← גרור את כל הקבצים והתיקיות (`fonts`, `icons`) ← Commit.
3. Settings ← Pages ← Source: Deploy from a branch ← Branch: `main` ו-`/ (root)` ← Save.
4. אחרי דקה-שתיים תופיע כתובת כמו `https://USER.github.io/helpdesk-pocket/`.

## התקנה באייפון

1. פתח את הכתובת ב-**Safari** (לא בכרום).
2. המתן שהדף ייטען עד הסוף, פעם אחת עם אינטרנט.
3. כפתור שיתוף ← **Add to Home Screen** ← Add.
4. פתח מהאייקון במסך הבית. כבה את האינטרנט ובדוק שהכל נפתח.

## גיבוי

iOS עלול לנקות נתוני אתרים שלא נעשה בהם שימוש זמן רב. גבה מדי פעם:
הגדרות ← **ייצוא ל-JSON** ← שמור ב-Files / iCloud. לשחזור: **ייבוא מ-JSON** (ממזג לפי id, בלי כפילויות).

## עדכון האפליקציה

כשמחליפים קבצים, העלה את `VERSION` ב-`sw.js` (למשל `helpdesk-v2`) כדי שהטלפון יוריד את הגרסה החדשה.

## מבנה

- `index.html`, `styles.css`, `app.js`: האפליקציה
- `data.js`: רשומות ההתחלה (נטענות פעם אחת למסד הנתונים)
- `sw.js`: service worker שמאחסן את כל הקבצים לעבודה אופליין
- `fonts/`: Heebo ו-JetBrains Mono, מצורפים (בלי תלות באינטרנט)
- `icons/`: אייקונים לאייפון
