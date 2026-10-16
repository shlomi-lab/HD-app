/* Seed data for the helpdesk toolkit. Imported once into IndexedDB. */
window.SEED_ENTRIES = [
 {
  "id": "ad-lockout",
  "titleHe": "חשבון משתמש נעול",
  "titleEn": "Account lockout",
  "category": "AD",
  "symptom": "המשתמש מקבל \"החשבון נעול\" או שהסיסמה נדחית שוב ושוב. לרוב מכשיר ישן, מיפוי כונן או סשן RDP שומרים סיסמה ישנה.",
  "commands": [
   {
    "label": "מי נעול כרגע",
    "text": "Search-ADAccount -LockedOut | Select Name,SamAccountName,LockedOut"
   },
   {
    "label": "פירוט המשתמש",
    "text": "Get-ADUser USER -Properties LockedOut,badPwdCount,LastBadPasswordAttempt,PasswordLastSet"
   },
   {
    "label": "שחרור הנעילה",
    "text": "Unlock-ADAccount -Identity USER"
   },
   {
    "label": "מי ה-PDC (שם נמצאים אירועי הנעילה)",
    "text": "(Get-ADDomain).PDCEmulator"
   },
   {
    "label": "אירועי נעילה 4740 ב-PDC",
    "text": "Get-WinEvent -ComputerName PDC -FilterHashtable @{LogName='Security';Id=4740} -MaxEvents 5 | Format-List TimeCreated,Message"
   }
  ],
  "guiSteps": [
   "פתח dsa.msc (Active Directory Users and Computers).",
   "חפש את המשתמש ← קליק ימני ← Properties.",
   "לשונית Account ← סמן Unlock account ← OK.",
   "בדוק באירוע 4740 מה שם המחשב ששלח את הסיסמה השגויה (Caller Computer Name).",
   "במחשב הזה: נקה סיסמאות שמורות (Credential Manager), כוננים ממופים, שירותים ומשימות מתוזמנות שרצים עם החשבון."
  ],
  "ifNotWorking": "אם הנעילה חוזרת תוך דקות: מצא את המקור לפי Caller Computer Name באירוע 4740, ובדוק שם סשנים פתוחים (query user), טלפון/Outlook עם סיסמה ישנה, ומשימות מתוזמנות.",
  "notes": "שחרור בלי למצוא את המקור רק דוחה את הבעיה. סף הנעילה ומשך הנעילה נקבעים במדיניות סיסמאות.",
  "tags": [
   "lockout",
   "נעילה",
   "נעול",
   "password",
   "סיסמה",
   "4740",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ad-password-expired",
  "titleHe": "סיסמה פגה / איפוס סיסמה",
  "titleEn": "Password expired / reset",
  "category": "AD",
  "symptom": "המשתמש לא נכנס, מקבל \"הסיסמה פגה\" או שצריך לאפס סיסמה.",
  "commands": [
   {
    "label": "מצב הסיסמה",
    "text": "Get-ADUser USER -Properties PasswordExpired,PasswordLastSet,PasswordNeverExpires,\"msDS-UserPasswordExpiryTimeComputed\""
   },
   {
    "label": "איפוס סיסמה",
    "text": "Set-ADAccountPassword -Identity USER -Reset -NewPassword (Read-Host -AsSecureString \"New password\")"
   },
   {
    "label": "חובה לשנות בכניסה הבאה",
    "text": "Set-ADUser -Identity USER -ChangePasswordAtLogon $true"
   },
   {
    "label": "מי יפוג בקרוב",
    "text": "Get-ADUser -Filter {Enabled -eq $true -and PasswordNeverExpires -eq $false} -Properties \"msDS-UserPasswordExpiryTimeComputed\" | Select Name,@{n=\"Expires\";e={[datetime]::FromFileTime($_.\"msDS-UserPasswordExpiryTimeComputed\")}} | Sort Expires | Select -First 20"
   }
  ],
  "guiSteps": [
   "dsa.msc ← חפש את המשתמש ← קליק ימני ← Reset Password.",
   "הזן סיסמה זמנית ← סמן User must change password at next logon.",
   "אם החשבון נעול סמן גם Unlock the user's account ← OK.",
   "ודא שהמשתמש מתחבר, ושינה את הסיסמה גם בטלפון ובכל מכשיר שמחובר לחשבון."
  ],
  "ifNotWorking": "אם האיפוס נדחה: מדיניות סיסמאות דורשת מורכבות או היסטוריה. בדוק Get-ADDefaultDomainPasswordPolicy ו-Fine-Grained policies.",
  "notes": "אל תשלח סיסמה זמנית במייל. מסור בטלפון או בנפרד.",
  "tags": [
   "password",
   "סיסמה",
   "expired",
   "פגה",
   "reset",
   "איפוס",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ad-disabled",
  "titleHe": "חשבון מושבת או פג תוקף",
  "titleEn": "Account disabled / expired",
  "category": "AD",
  "symptom": "המשתמש לא נכנס והסיסמה נכונה. החשבון מושבת או בעל תאריך תפוגה.",
  "commands": [
   {
    "label": "בדיקת מצב",
    "text": "Get-ADUser USER -Properties Enabled,AccountExpirationDate,LockedOut | Select Name,Enabled,AccountExpirationDate,LockedOut"
   },
   {
    "label": "הפעלה",
    "text": "Enable-ADAccount -Identity USER"
   },
   {
    "label": "ביטול תאריך תפוגה",
    "text": "Clear-ADAccountExpiration -Identity USER"
   },
   {
    "label": "מושבתים בכל הדומיין",
    "text": "Search-ADAccount -AccountDisabled -UsersOnly | Select Name,SamAccountName"
   }
  ],
  "guiSteps": [
   "dsa.msc ← המשתמש ← קליק ימני: אם כתוב Enable Account, החשבון מושבת.",
   "Properties ← Account ← בדוק Account expires.",
   "בדוק גם שעות כניסה (Logon Hours) ומחשבים מותרים (Log On To)."
  ],
  "ifNotWorking": "אם החשבון מופעל וממשיך להיכשל: בדוק שעון (Kerberos), תקינות DNS, ושהמשתמש נכנס לדומיין הנכון (DOMAIN\\user).",
  "notes": "לפני הפעלה מחדש של חשבון של עובד שעזב, אשר עם מנהל. כל הפעלה צריכה לבוא מבקשה.",
  "tags": [
   "disabled",
   "מושבת",
   "expired",
   "תפוגה",
   "login",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ad-trust",
  "titleHe": "יחסי האמון עם הדומיין נכשלו",
  "titleEn": "Trust relationship failed",
  "category": "AD",
  "symptom": "\"The trust relationship between this workstation and the primary domain failed\". סיסמת חשבון המחשב לא תואמת לדומיין.",
  "commands": [
   {
    "label": "בדיקת ערוץ מאובטח",
    "text": "Test-ComputerSecureChannel -Verbose"
   },
   {
    "label": "תיקון",
    "text": "Test-ComputerSecureChannel -Repair -Credential (Get-Credential)"
   },
   {
    "label": "איפוס סיסמת מחשב",
    "text": "Reset-ComputerMachinePassword -Server DC01 -Credential (Get-Credential)"
   },
   {
    "label": "בדיקה ב-nltest",
    "text": "nltest /sc_verify:DOMAIN"
   },
   {
    "label": "הצטרפות מחדש",
    "text": "Add-Computer -DomainName DOMAIN -Credential (Get-Credential) -Restart"
   }
  ],
  "guiSteps": [
   "היכנס עם חשבון מנהל מקומי (.\\Administrator) או עם משתמש שמור במטמון.",
   "הרץ PowerShell כמנהל ← Test-ComputerSecureChannel -Repair עם פרטי מנהל דומיין.",
   "אם לא עבד: sysdm.cpl ← Change ← Workgroup ← הפעל מחדש ← Change ← Domain ← הזן פרטי מנהל.",
   "ודא שחשבון המחשב קיים ב-dsa.msc ושאינו מושבת."
  ],
  "ifNotWorking": "ודא שהמחשב מצביע על ה-DNS של ה-DC, ושהשעון תקין. אם המחשב משוכפל או שוחזר מ-snapshot, ההצטרפות מחדש היא הפתרון.",
  "notes": "שחזור מ-snapshot ישן הוא סיבה נפוצה. לפני הצטרפות מחדש בדוק שאין חשבון כפול.",
  "tags": [
   "trust",
   "אמון",
   "domain",
   "דומיין",
   "secure channel",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ad-temp-profile",
  "titleHe": "פרופיל זמני בכניסה",
  "titleEn": "Temporary profile on logon",
  "category": "AD",
  "symptom": "המשתמש נכנס ורואה שולחן עבודה ריק ו\"לא ניתן להתחבר לפרופיל שלך\". אירוע 1511 או 1515.",
  "commands": [
   {
    "label": "SID של המשתמש",
    "text": "whoami /user"
   },
   {
    "label": "רשימת פרופילים בריגסטרי",
    "text": "reg query \"HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList\""
   },
   {
    "label": "גיבוי המפתח לפני שינוי",
    "text": "reg export \"HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList\" C:\\ProfileList-backup.reg"
   },
   {
    "label": "פרופילים בתיקייה",
    "text": "dir C:\\Users"
   }
  ],
  "guiSteps": [
   "התנתק, היכנס כמנהל אחר ושמור גיבוי של C:\\Users\\USER.",
   "regedit ← HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList.",
   "חפש את ה-SID של המשתמש. אם יש שני מפתחות (אחד עם סיומת .bak), הסר את הסיומת .bak מהמקורי ושנה שם לפגום.",
   "במפתח התקין: State = 0 ו-RefCount = 0 ← הפעל מחדש ← נסה להיכנס."
  ],
  "ifNotWorking": "אם עדיין זמני: שנה את שם התיקייה C:\\Users\\USER ל-USER.old, אפשר למחוק את מפתח ה-SID מהריגסטרי ולהיכנס שוב ליצירת פרופיל חדש, ואז להעתיק את הקבצים.",
  "notes": "אל תמחק פרופיל לפני שיש גיבוי. בפרופיל נודד (Roaming) או Folder Redirection בדוק גם את שרת הקבצים.",
  "tags": [
   "profile",
   "פרופיל",
   "temporary",
   "זמני",
   "login",
   "ntuser",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ad-groups",
  "titleHe": "הרשאות וחברות בקבוצות",
  "titleEn": "Group membership / permissions",
  "category": "AD",
  "symptom": "המשתמש לא רואה תיקייה או לא מקבל גישה למשאב אחרי שהוסף לקבוצה.",
  "commands": [
   {
    "label": "קבוצות של משתמש",
    "text": "Get-ADPrincipalGroupMembership USER | Select Name,GroupCategory | Sort Name"
   },
   {
    "label": "חברי קבוצה",
    "text": "Get-ADGroupMember \"GROUP\" -Recursive | Select Name,SamAccountName"
   },
   {
    "label": "הוספה לקבוצה",
    "text": "Add-ADGroupMember -Identity \"GROUP\" -Members USER"
   },
   {
    "label": "קבוצות בטוקן הנוכחי",
    "text": "whoami /groups"
   },
   {
    "label": "רענון כרטיסי Kerberos",
    "text": "klist purge"
   }
  ],
  "guiSteps": [
   "dsa.msc ← חפש את הקבוצה ← Properties ← Members ← Add.",
   "או: חפש את המשתמש ← Properties ← Member Of ← Add.",
   "המשתמש צריך להתנתק ולהתחבר שוב (או klist purge) כדי שהטוקן יתעדכן.",
   "בדוק את ההרשאה בפועל: קליק ימני על התיקייה ← Properties ← Security ← Advanced ← Effective Access."
  ],
  "ifNotWorking": "אם עדיין אין גישה: ההרשאות על ה-Share מצטרפות להרשאות ה-NTFS, וההגבלה הקטנה מבין השתיים קובעת. בדוק את שתיהן. בדוק גם אם יש הרשאת Deny.",
  "notes": "הפרד בין שיוך לקבוצה (AD) לבין הרשאה על תיקייה (NTFS/Share). הקבוצה עצמה לא נותנת גישה בלי ACL.",
  "tags": [
   "groups",
   "קבוצות",
   "permissions",
   "הרשאות",
   "access denied",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ad-kerberos-time",
  "titleHe": "שעון לא מסונכרן / שגיאות Kerberos",
  "titleEn": "Time skew / Kerberos errors",
  "category": "AD",
  "symptom": "כניסה נכשלת בלי סיבה נראית לעין, או \"The security database on the server does not have a computer account\". הפרש שעון מעל 5 דקות שובר Kerberos.",
  "commands": [
   {
    "label": "מצב סנכרון",
    "text": "w32tm /query /status"
   },
   {
    "label": "מקור השעון",
    "text": "w32tm /query /source"
   },
   {
    "label": "סנכרון מיידי",
    "text": "w32tm /resync /force"
   },
   {
    "label": "הפרש מול DC",
    "text": "w32tm /stripchart /computer:DC01 /samples:3 /dataonly"
   },
   {
    "label": "כרטיסי Kerberos",
    "text": "klist"
   },
   {
    "label": "ניקוי כרטיסים",
    "text": "klist purge"
   }
  ],
  "guiSteps": [
   "לחץ ימני על השעון ← Adjust date and time ← בדוק אזור זמן ושעון קיץ.",
   "בדוק שהמחשב מקבל זמן מה-DC (ולא משרת חיצוני לא נכון).",
   "ב-DC הראשי (PDC Emulator) הגדר מקור זמן חיצוני אמין.",
   "אם זו מכונה וירטואלית: בדוק שסנכרון הזמן של ה-Hypervisor לא מתנגש."
  ],
  "ifNotWorking": "אם ההפרש נשאר: net stop w32time ← w32tm /unregister ← w32tm /register ← net start w32time ← w32tm /resync.",
  "notes": "שעון שגוי הוא בין הסיבות הנפוצות לתקלות כניסה אחרי שחזור VM או החלפת סוללה ב-CMOS.",
  "tags": [
   "time",
   "שעון",
   "kerberos",
   "ntp",
   "login",
   "wide"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ad-join-fails",
  "titleHe": "הצטרפות לדומיין נכשלת",
  "titleEn": "Cannot join domain",
  "category": "AD",
  "symptom": "\"An Active Directory Domain Controller could not be contacted\" בעת הצטרפות מחשב לדומיין.",
  "commands": [
   {
    "label": "DNS של המחשב",
    "text": "ipconfig /all"
   },
   {
    "label": "איתור DC",
    "text": "nltest /dsgetdc:DOMAIN"
   },
   {
    "label": "רשומות SRV",
    "text": "nslookup -type=SRV _ldap._tcp.dc._msdcs.DOMAIN"
   },
   {
    "label": "חיבור ל-DC בפורט LDAP",
    "text": "Test-NetConnection DC01 -Port 389"
   },
   {
    "label": "הצטרפות",
    "text": "Add-Computer -DomainName DOMAIN -Credential (Get-Credential) -Restart"
   }
  ],
  "guiSteps": [
   "ודא שה-DNS של כרטיס הרשת הוא ה-DC (ncpa.cpl ← Properties ← IPv4 ← DNS).",
   "בדוק שהמחשב מגיע ל-DC (ping, ובדיקת פורטים 53, 88, 389, 445).",
   "sysdm.cpl ← Change ← Domain ← הזן את שם הדומיין המלא (למשל company.local).",
   "השתמש בחשבון בעל הרשאה להוסיף מחשבים."
  ],
  "ifNotWorking": "אם נכשל: בדוק מגבלת Machine Account Quota (ברירת מחדל 10 מחשבים למשתמש), ושאין חשבון מחשב באותו שם עם סיסמה שונה.",
  "notes": "90% מהמקרים הם DNS שמצביע לראוטר או ל-8.8.8.8 במקום ל-DC.",
  "tags": [
   "join",
   "הצטרפות",
   "domain",
   "dns",
   "wide"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ad-recycle",
  "titleHe": "שחזור אובייקט שנמחק",
  "titleEn": "Restore deleted AD object",
  "category": "AD",
  "symptom": "משתמש, קבוצה או מחשב נמחקו בטעות מה-AD.",
  "commands": [
   {
    "label": "האם Recycle Bin פעיל",
    "text": "Get-ADOptionalFeature -Filter {Name -like \"Recycle*\"} | Select Name,EnabledScopes"
   },
   {
    "label": "חיפוש מחוקים",
    "text": "Get-ADObject -Filter {isDeleted -eq $true -and Name -like \"*USER*\"} -IncludeDeletedObjects -Properties LastKnownParent | Select Name,LastKnownParent,ObjectGUID"
   },
   {
    "label": "שחזור",
    "text": "Get-ADObject -Filter {Name -like \"*USER*\"} -IncludeDeletedObjects | Restore-ADObject"
   }
  ],
  "guiSteps": [
   "ב-ADAC (dsac.exe) ← Deleted Objects ← בחר את האובייקט ← Restore.",
   "ודא שהאובייקט חזר ל-OU המקורי, ושהקבוצות (SID History/חברות) תקינות."
  ],
  "ifNotWorking": "אם ה-Recycle Bin לא הופעל: שחזור מגיבוי System State (authoritative restore). זו פעולה מורכבת, לא לעשות בלי נוהל וגיבוי עדכני.",
  "notes": "הפעלת Recycle Bin היא חד-כיוונית. בדוק מראש עם מנהל לפני הפעלה בארגון.",
  "tags": [
   "restore",
   "שחזור",
   "deleted",
   "נמחק",
   "recycle bin",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "dc-dcdiag",
  "titleHe": "בדיקת תקינות Domain Controller",
  "titleEn": "DC health check (dcdiag)",
  "category": "DNS/DC",
  "symptom": "חשד לתקלה ב-DC: לוגינים איטיים, GPO לא מגיעים, או לפני ואחרי שינוי בשרת.",
  "commands": [
   {
    "label": "בדיקה מלאה",
    "text": "dcdiag /v /c /d /e /s:DC01 > C:\\dcdiag.txt"
   },
   {
    "label": "בדיקה קצרה (שגיאות בלבד)",
    "text": "dcdiag /q"
   },
   {
    "label": "בדיקת DNS",
    "text": "dcdiag /test:dns /v"
   },
   {
    "label": "שירותים חיוניים",
    "text": "Get-Service NTDS,DNS,Netlogon,KDC,W32Time,DFSR | Select Name,Status"
   }
  ],
  "guiSteps": [
   "פתח CMD כמנהל ב-DC והרץ dcdiag /q.",
   "חפש שורות עם \"failed\". כל Test שנכשל ידווח באיזה DC.",
   "בדוק Event Viewer ← Directory Service ו-DNS Server."
  ],
  "ifNotWorking": "לכל Test שנכשל חפש את שם ה-Test: Connectivity, Advertising, FSMO, Replications, Services, SysVolCheck, KnowsOfRoleHolders.",
  "notes": "שגיאות DNS הן שורש רוב תקלות ה-AD. תקן אותן קודם.",
  "tags": [
   "dcdiag",
   "health",
   "dc",
   "בדיקה",
   "wide"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "dc-replication",
  "titleHe": "שגיאות רפליקציה בין DC",
  "titleEn": "AD replication errors",
  "category": "DNS/DC",
  "symptom": "שינויים (משתמש, סיסמה, GPO) לא מופיעים בכל ה-DC. הודעות כמו 8453, 1722, 8606.",
  "commands": [
   {
    "label": "סיכום",
    "text": "repadmin /replsummary"
   },
   {
    "label": "פירוט",
    "text": "repadmin /showrepl * /csv > C:\\showrepl.csv"
   },
   {
    "label": "כפיית סנכרון",
    "text": "repadmin /syncall /AdeP"
   },
   {
    "label": "תור רפליקציה",
    "text": "repadmin /queue"
   },
   {
    "label": "בדיקת KCC",
    "text": "repadmin /kcc"
   }
  ],
  "guiSteps": [
   "פתח dssite.msc ← Sites ← Servers ← NTDS Settings ← בדוק Connections.",
   "קליק ימני על חיבור ← Replicate Now.",
   "בדוק DNS בכל DC, שהכתובת של ה-DC האחר נפתרת לפי שם."
  ],
  "ifNotWorking": "אם נכשל מול DC אחד: בדוק חיבור (פורטים 135, 389, 445, וטווח RPC דינמי), שעון, ו-DNS. אל תסיר DC לפני שהבנת את הסיבה.",
  "notes": "שגיאה 1722 = RPC לא זמין (רשת/חומת אש). 8606/8453 = הרשאות. כולל קישור לדוח נתון בלוג Directory Service.",
  "tags": [
   "replication",
   "רפליקציה",
   "repadmin",
   "dc",
   "sync",
   "wide"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "dns-resolve",
  "titleHe": "DNS לא פותר שמות",
  "titleEn": "DNS resolution failures",
  "category": "DNS/DC",
  "symptom": "ping לפי שם נכשל, אבל ping לפי IP עובד. אתר פנימי לא נפתח.",
  "commands": [
   {
    "label": "בדיקת שם",
    "text": "nslookup HOSTNAME"
   },
   {
    "label": "PowerShell",
    "text": "Resolve-DnsName HOSTNAME -Server DC01"
   },
   {
    "label": "ניקוי מטמון",
    "text": "ipconfig /flushdns"
   },
   {
    "label": "רישום מחדש",
    "text": "ipconfig /registerdns"
   },
   {
    "label": "רשומות DC",
    "text": "nslookup -type=SRV _ldap._tcp.dc._msdcs.DOMAIN"
   },
   {
    "label": "מי ה-DNS של המחשב",
    "text": "Get-DnsClientServerAddress -AddressFamily IPv4"
   }
  ],
  "guiSteps": [
   "ncpa.cpl ← כרטיס הרשת ← Properties ← IPv4 ← בדוק שה-DNS מצביע ל-DC (ולא ל-8.8.8.8 או לראוטר).",
   "בשרת DNS: dnsmgmt.msc ← Forward Lookup Zones ← בדוק שהרשומה קיימת וה-Zone תקינה.",
   "בדוק Scavenging והאם רשומה ישנה (Stale) מצביעה ל-IP שגוי."
  ],
  "ifNotWorking": "אם נפתר מול DC אחד ולא מול אחר: בעיית רפליקציית DNS (ראה רפליקציה). בדוק Forwarders ב-dnsmgmt.msc.",
  "notes": "כלל זהב: מחשבי דומיין מצביעים רק ל-DNS של ה-DC. את הפורוורד החיצוני מגדירים בשרת.",
  "tags": [
   "dns",
   "resolve",
   "nslookup",
   "שם",
   "wide"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "dc-locate",
  "titleHe": "המחשב לא מוצא Domain Controller",
  "titleEn": "Cannot locate DC",
  "category": "DNS/DC",
  "symptom": "הודעות \"domain not available\", כניסה איטית מאוד, GPO לא נטענים.",
  "commands": [
   {
    "label": "איתור DC",
    "text": "nltest /dsgetdc:DOMAIN"
   },
   {
    "label": "רשימת DC",
    "text": "nltest /dclist:DOMAIN"
   },
   {
    "label": "בדיקת אתר",
    "text": "nltest /dsgetsite"
   },
   {
    "label": "חיבורי LDAP",
    "text": "Test-NetConnection DC01 -Port 389"
   },
   {
    "label": "חיבורי Kerberos",
    "text": "Test-NetConnection DC01 -Port 88"
   }
  ],
  "guiSteps": [
   "בדוק DNS בכרטיס הרשת.",
   "בדוק שהמחשב נמצא באתר (Site) הנכון ב-dssite.msc לפי תת-רשת (Subnet).",
   "בדוק חיבור פיזי/VPN ושחומת האש לא חוסמת 53, 88, 135, 389, 445, 464, 3268."
  ],
  "ifNotWorking": "אם אחרי VPN: בדוק שה-DNS של ה-VPN מצביע ל-DC והראוטינג תקין.",
  "notes": "אם תת-רשת חדשה אינה מוגדרת ב-AD Sites, מחשבים בה פונים ל-DC רנדומלי ולפעמים רחוק.",
  "tags": [
   "dc",
   "locate",
   "nltest",
   "login",
   "wide"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "dc-fsmo",
  "titleHe": "בעלי תפקידי FSMO",
  "titleEn": "FSMO roles",
  "category": "DNS/DC",
  "symptom": "DC כבה לצמיתות או אינו נגיש, ויש לברר איפה יושבים התפקידים (PDC Emulator, RID, Schema, Naming, Infrastructure).",
  "commands": [
   {
    "label": "מי מחזיק",
    "text": "netdom query fsmo"
   },
   {
    "label": "PowerShell",
    "text": "Get-ADDomain | Select PDCEmulator,RIDMaster,InfrastructureMaster; Get-ADForest | Select SchemaMaster,DomainNamingMaster"
   },
   {
    "label": "העברה (שרת חי)",
    "text": "Move-ADDirectoryServerOperationMasterRole -Identity DC02 -OperationMasterRole PDCEmulator,RIDMaster,InfrastructureMaster,SchemaMaster,DomainNamingMaster"
   }
  ],
  "guiSteps": [
   "dsa.msc ← Operations Masters (קליק ימני על הדומיין) לבדיקה והעברה של PDC/RID/Infrastructure.",
   "domain.msc לבעל Domain Naming.",
   "עבור Schema Master: Active Directory Schema snap-in (regsvr32 schmmgmt.dll)."
  ],
  "ifNotWorking": "אם ה-DC המקורי אבד: Seize (ולא Transfer) רק כשאי אפשר להחזיר אותו לעולם, והסר את המטא-דאטה שלו.",
  "notes": "העברה (Transfer) היא רגילה. תפיסה (Seize) היא מצב חירום ולא חוזרים ממנה.",
  "tags": [
   "fsmo",
   "pdc",
   "roles",
   "dc",
   "wide"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "dc-sysvol",
  "titleHe": "SYSVOL / NETLOGON לא משותפים",
  "titleEn": "SYSVOL / NETLOGON share missing",
  "category": "DNS/DC",
  "symptom": "GPO לא מגיעים וסקריפטי כניסה לא רצים. \\\\DOMAIN\\SYSVOL לא נפתח.",
  "commands": [
   {
    "label": "שיתופים ב-DC",
    "text": "net share"
   },
   {
    "label": "שירותים",
    "text": "Get-Service DFSR,Netlogon,NTDS | Select Name,Status"
   },
   {
    "label": "בדיקת DC",
    "text": "dcdiag /test:sysvolcheck /test:netlogons"
   },
   {
    "label": "מצב מיגרציית DFSR",
    "text": "dfsrmig /getglobalstate"
   },
   {
    "label": "אירועי DFSR",
    "text": "Get-WinEvent -FilterHashtable @{LogName='DFS Replication'} -MaxEvents 15 | Select TimeCreated,Id,Message"
   }
  ],
  "guiSteps": [
   "services.msc ← DFS Replication ← ודא שרץ.",
   "eventvwr.msc ← Applications and Services Logs ← DFS Replication ← חפש 4012 / 2213 / 4614.",
   "ודא שהדיסק לא מלא ושה-DC לא נכבה פתאום (Dirty Shutdown)."
  ],
  "ifNotWorking": "אם 2213 (DFSR paused after unexpected shutdown): בצע ResumeReplication לפי הוראות Microsoft. אם שחזור לא אפשרי: Non-authoritative restore רק אחרי גיבוי.",
  "notes": "פעולות על SYSVOL (authoritative/non-authoritative) מסוכנות. תעד ותאם לפני.",
  "tags": [
   "sysvol",
   "netlogon",
   "gpo",
   "dfsr",
   "wide"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "gpo-not-applying",
  "titleHe": "GPO לא חל על המחשב / משתמש",
  "titleEn": "GPO not applying",
  "category": "GPO",
  "symptom": "הגדרה שהוגדרה ב-GPO לא מופיעה אצל המשתמש או במחשב.",
  "commands": [
   {
    "label": "רענון מיידי",
    "text": "gpupdate /force"
   },
   {
    "label": "סיכום תוצאות",
    "text": "gpresult /r"
   },
   {
    "label": "דוח HTML מלא",
    "text": "gpresult /h C:\\gp.html /f"
   },
   {
    "label": "דוח למשתמש ספציפי (כמנהל)",
    "text": "gpresult /s COMPUTER /user DOMAIN\\USER /h C:\\gp.html"
   },
   {
    "label": "מדיניות אפקטיבית",
    "text": "rsop.msc"
   }
  ],
  "guiSteps": [
   "gpmc.msc ← בדוק שה-GPO מקושר ל-OU הנכון ושאינו מושבת (Link Enabled).",
   "לשונית Scope ← Security Filtering: האם המשתמש/מחשב או Authenticated Users כלולים, ויש הרשאת Read + Apply.",
   "בדוק WMI Filter, Block Inheritance על ה-OU, ו-Enforced על GPO אחרים.",
   "ב-Group Policy Results (קליק ימני על המשתמש/מחשב) ← Group Policy Results Wizard.",
   "שים לב: הגדרת User Configuration חלה רק אם אובייקט המשתמש ב-OU של ה-GPO (אלא אם Loopback)."
  ],
  "ifNotWorking": "אם gpupdate נכשל: בדוק DNS, שעון, וגישה ל-SYSVOL. אם הגדרות מחשב לא חלות, נדרש לפעמים restart ולא רק gpupdate.",
  "notes": "סדר עיבוד: Local → Site → Domain → OU (LSDOU). האחרון קובע, חוץ מ-Enforced.",
  "tags": [
   "gpo",
   "group policy",
   "gpupdate",
   "gpresult",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "gpo-drive-map",
  "titleHe": "מיפוי כונן דרך GPO לא עובד",
  "titleEn": "Drive mapping via GPO fails",
  "category": "GPO",
  "symptom": "כונן רשת לא מופיע אצל המשתמש, או מופיע רק לפעמים.",
  "commands": [
   {
    "label": "כוננים ממופים",
    "text": "net use"
   },
   {
    "label": "רענון",
    "text": "gpupdate /force"
   },
   {
    "label": "בדיקת גישה לשיתוף",
    "text": "Test-Path \\\\SERVER\\SHARE"
   },
   {
    "label": "תוצאות GPO",
    "text": "gpresult /r /scope user"
   }
  ],
  "guiSteps": [
   "gpmc.msc ← ערוך את ה-GPO ← User Configuration ← Preferences ← Windows Settings ← Drive Maps.",
   "בדוק Action (Create/Update/Replace) ו-Reconnect.",
   "אם יש Item-level targeting בדוק שהוא מתאים לקבוצה.",
   "במחשב: התנתק והתחבר (מיפוי רץ בכניסה). ודא שהמשתמש רואה את השיתוף (הרשאות Share + NTFS)."
  ],
  "ifNotWorking": "אם עובד רק אחרי gpupdate: רשת עולה מאוחר. הפעל Always wait for the network at computer startup and logon.",
  "notes": "מיפוי כונן כמנהל (UAC) לא נראה למשתמש רגיל, וההפך. בדוק באיזה הקשר רץ ה-Explorer.",
  "tags": [
   "drive",
   "map",
   "כונן",
   "gpo",
   "share",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "gpo-backup",
  "titleHe": "גיבוי ושחזור GPO",
  "titleEn": "Backup / restore GPO",
  "category": "GPO",
  "symptom": "לפני שינוי מדיניות, או שמדיניות נמחקה/שונתה בטעות.",
  "commands": [
   {
    "label": "כל ה-GPO לגיבוי",
    "text": "Backup-GPO -All -Path C:\\GPOBackup"
   },
   {
    "label": "GPO אחד",
    "text": "Backup-GPO -Name \"NAME\" -Path C:\\GPOBackup"
   },
   {
    "label": "שחזור",
    "text": "Restore-GPO -Name \"NAME\" -Path C:\\GPOBackup"
   },
   {
    "label": "רשימת GPO",
    "text": "Get-GPO -All | Select DisplayName,GpoStatus,ModificationTime"
   }
  ],
  "guiSteps": [
   "gpmc.msc ← Group Policy Objects ← קליק ימני על GPO ← Back Up.",
   "לשחזור: קליק ימני על Group Policy Objects ← Manage Backups ← Restore."
  ],
  "ifNotWorking": "אם נמחק אובייקט הקישור: שחזר גם את הקישור ל-OU בנפרד.",
  "notes": "גבה לפני כל שינוי. אלה ארבע שניות שחוסכות שעתיים.",
  "tags": [
   "gpo",
   "backup",
   "גיבוי",
   "restore"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "gpo-password-policy",
  "titleHe": "מדיניות סיסמאות ונעילה",
  "titleEn": "Password & lockout policy",
  "category": "GPO",
  "symptom": "לבדוק או לשנות מורכבות, אורך, תוקף ורף נעילה.",
  "commands": [
   {
    "label": "מדיניות הדומיין",
    "text": "Get-ADDefaultDomainPasswordPolicy"
   },
   {
    "label": "Fine-Grained",
    "text": "Get-ADFineGrainedPasswordPolicy -Filter *"
   },
   {
    "label": "מדיניות על משתמש",
    "text": "Get-ADUserResultantPasswordPolicy USER"
   }
  ],
  "guiSteps": [
   "gpmc.msc ← Default Domain Policy ← Edit.",
   "Computer Configuration ← Policies ← Windows Settings ← Security Settings ← Account Policies.",
   "Password Policy ו-Account Lockout Policy.",
   "מדיניות שונה לקבוצה מסוימת נעשית ב-ADAC ← Password Settings Container."
  ],
  "ifNotWorking": "מדיניות סיסמאות ברמת הדומיין נקבעת רק ב-Default Domain Policy. GPO אחר ב-OU לא ישנה אותה למשתמשי דומיין.",
  "notes": "לפני שינוי בדוק עם הנהלה. הקשחה פתאומית נועלת משתמשים בהמוניהם.",
  "tags": [
   "password",
   "policy",
   "lockout",
   "gpo"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "rdp-cannot-connect",
  "titleHe": "RDP לא מתחבר",
  "titleEn": "RDP cannot connect",
  "category": "Remote Access",
  "symptom": "\"Remote Desktop can't connect to the remote computer\".",
  "commands": [
   {
    "label": "בדיקת פורט",
    "text": "Test-NetConnection SERVER -Port 3389"
   },
   {
    "label": "שירות RDP",
    "text": "Get-Service TermService,UmRdpService | Select Name,Status"
   },
   {
    "label": "כלל חומת אש",
    "text": "Enable-NetFirewallRule -DisplayGroup \"Remote Desktop\""
   },
   {
    "label": "פתיחת RDP בריגסטרי",
    "text": "reg add \"HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\" /v fDenyTSConnections /t REG_DWORD /d 0 /f"
   },
   {
    "label": "חיבור",
    "text": "mstsc /v:SERVER"
   }
  ],
  "guiSteps": [
   "במחשב היעד: sysdm.cpl ← Remote ← Allow remote connections.",
   "Select Users: ודא שהמשתמש חבר בקבוצה Remote Desktop Users (או מנהל).",
   "שחומת האש מאפשרת Remote Desktop (firewall.cpl ← Allow an app).",
   "ודא שהשרת מקבל כתובת נכונה: ping SERVER."
  ],
  "ifNotWorking": "אם הפורט פתוח ועדיין נכשל: NLA/CredSSP, אישורים או מגבלת מספר סשנים. בדוק Event Viewer ← TerminalServices-RemoteConnectionManager.",
  "notes": "פורט 3389 לא נחשף לאינטרנט. ל-RDP חיצוני השתמש ב-VPN או Gateway.",
  "tags": [
   "rdp",
   "remote desktop",
   "mstsc",
   "3389",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ts-frozen",
  "titleHe": "Terminal Server תקוע / סשן קפוא",
  "titleEn": "Terminal Server frozen session",
  "category": "Remote Access",
  "symptom": "משתמשים מתלוננים שהשרת איטי או תקוע, או סשן שלא נסגר.",
  "commands": [
   {
    "label": "כל הסשנים",
    "text": "query user /server:SERVER"
   },
   {
    "label": "פירוט סשנים",
    "text": "qwinsta /server:SERVER"
   },
   {
    "label": "ניתוק משתמש (Logoff)",
    "text": "logoff ID /server:SERVER"
   },
   {
    "label": "איפוס סשן תקוע",
    "text": "reset session ID /server:SERVER"
   },
   {
    "label": "תהליכים לפי זיכרון",
    "text": "Get-Process -IncludeUserName | Sort WS -Descending | Select -First 15 Name,UserName,@{n=\"MB\";e={[int]($_.WS/1MB)}}"
   },
   {
    "label": "צפייה בסשן (Shadow)",
    "text": "mstsc /shadow:ID /v:SERVER /control"
   }
  ],
  "guiSteps": [
   "טען את מנהל המשימות (taskmgr) ← Users: מי צורך CPU/זיכרון.",
   "בדוק דיסק מלא, זיכרון, ושירותי Spooler / Profile.",
   "לסשן בלי תגובה: logoff ID, ואם לא ← reset session ID.",
   "לפני איפוס הודע למשתמש. איפוס מאבד עבודה שלא נשמרה.",
   "אם כל השרת תקוע: Event Viewer ← System ← חפש 2004 (נגמר זיכרון) / 4202 / Disk."
  ],
  "ifNotWorking": "אם חוזר על עצמו: בדוק תוכנה אחת שדולפת זיכרון, Profile גדול מדי, אנטי-וירוס סורק בזמן כניסה, או דיסק איטי. שקול הגדרת הפעלה מחדש מתוזמנת.",
  "notes": "אל תהרוג תהליכי System. אם השרת לא מגיב בכלל, הפעל מחדש רק בתיאום, אחרי שניסית להתחבר לקונסול (mstsc /admin).",
  "tags": [
   "terminal server",
   "ts",
   "frozen",
   "תקוע",
   "rds",
   "session",
   "wide"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "rds-license",
  "titleHe": "אין רישיונות RDS",
  "titleEn": "No RDS licenses",
  "category": "Remote Access",
  "symptom": "\"No Remote Desktop License Servers available\" או \"The remote session was disconnected because there are no Remote Desktop client access licenses\".",
  "commands": [
   {
    "label": "הגדרת רישוי",
    "text": "Get-RDLicenseConfiguration"
   },
   {
    "label": "אבחון",
    "text": "licmgr.exe"
   },
   {
    "label": "בדיקת מצב ברישום",
    "text": "reg query \"HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\\RCM\\GracePeriod\""
   }
  ],
  "guiSteps": [
   "licmgr.exe ← ודא ששרת הרישוי Activated וה-CALs מותקנים.",
   "gpedit.msc / GPO ← Computer Config ← Admin Templates ← Windows Components ← Remote Desktop Services ← Remote Desktop Session Host ← Licensing ← Use the specified RD license servers + Set the RD licensing mode.",
   "ודא שהמצב (Per User / Per Device) תואם ל-CALs שנרכשו."
  ],
  "ifNotWorking": "אם תקופת החסד נגמרה: ניתוק רק לפי מנהלי. פנה לספק הרישוי. ל-Per Device מחק מפתח חסד ישן רק לפי הוראות רשמיות.",
  "notes": "אל תמחק מפתחות GracePeriod כדי \"לעקוף\" רישוי. זו הפרת רישיון.",
  "tags": [
   "rds",
   "license",
   "רישיון",
   "cal",
   "terminal server",
   "wide"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "rdp-black-screen",
  "titleHe": "RDP מסך שחור או בלי שורת משימות",
  "titleEn": "RDP black screen / missing taskbar",
  "category": "Remote Access",
  "symptom": "מתחברים ל-RDP ורואים מסך שחור, או שולחן עבודה בלי Taskbar.",
  "commands": [
   {
    "label": "מצב Explorer",
    "text": "tasklist /fi \"imagename eq explorer.exe\""
   },
   {
    "label": "הפעלת Explorer מחדש",
    "text": "taskkill /f /im explorer.exe & start explorer.exe"
   },
   {
    "label": "ניתוק הסשן",
    "text": "logoff ID /server:SERVER"
   }
  ],
  "guiSteps": [
   "Ctrl+Alt+End (בתוך סשן RDP) ← Task Manager ← File ← Run new task ← explorer.exe.",
   "אם נתקע: התנתק (logoff) והתחבר מחדש.",
   "במסך ההתחברות (mstsc) ← Show Options ← Experience ← בטל Persistent bitmap caching או שנה צבעים ל-16 סיביות.",
   "עדכן דרייבר גרפי / בטל Hardware acceleration ב-GPO אם צריך."
  ],
  "ifNotWorking": "אם חוזר: Profile פגום (ראה פרופיל זמני), או Group Policy ל-Shell שגוי.",
  "notes": "ב-RDP השתמש ב-Ctrl+Alt+End במקום Ctrl+Alt+Del.",
  "tags": [
   "rdp",
   "black screen",
   "מסך שחור",
   "explorer",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "rdp-credssp",
  "titleHe": "שגיאת CredSSP / Encryption Oracle",
  "titleEn": "CredSSP encryption oracle error",
  "category": "Remote Access",
  "symptom": "\"An authentication error has occurred. The function requested is not supported. This could be due to CredSSP encryption oracle remediation\".",
  "commands": [
   {
    "label": "גרסת Windows ועדכונים",
    "text": "Get-HotFix | Sort InstalledOn -Descending | Select -First 5"
   },
   {
    "label": "הגדרה זמנית בריגסטרי (לא מומלץ)",
    "text": "reg add \"HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System\\CredSSP\\Parameters\" /v AllowEncryptionOracle /t REG_DWORD /d 2 /f"
   }
  ],
  "guiSteps": [
   "הפתרון האמיתי: התקן עדכוני אבטחה בשני הצדדים (לקוח ושרת).",
   "זמנית בלבד: GPO ← Computer Config ← Admin Templates ← System ← Credentials Delegation ← Encryption Oracle Remediation ← Vulnerable.",
   "אחרי עדכון החזר את ההגדרה למצב Default/Mitigated."
  ],
  "ifNotWorking": "אם אין אפשרות לעדכן את השרת מייד, התחבר לקונסול (VM console) ועדכן שם.",
  "notes": "הגדרה Vulnerable פותחת חולשת אבטחה. שמור אותה זמנית בלבד ותעד.",
  "tags": [
   "credssp",
   "rdp",
   "encryption oracle",
   "security",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "psremoting",
  "titleHe": "PowerShell Remoting לא עובד",
  "titleEn": "PowerShell remoting / WinRM fails",
  "category": "Remote Access",
  "symptom": "Enter-PSSession או Invoke-Command נכשלים.",
  "commands": [
   {
    "label": "הפעלה במחשב היעד",
    "text": "Enable-PSRemoting -Force"
   },
   {
    "label": "בדיקת חיבור",
    "text": "Test-WSMan SERVER"
   },
   {
    "label": "כניסה",
    "text": "Enter-PSSession -ComputerName SERVER -Credential (Get-Credential)"
   },
   {
    "label": "סביבת Workgroup: TrustedHosts",
    "text": "Set-Item WSMan:\\localhost\\Client\\TrustedHosts -Value \"SERVER\" -Force"
   },
   {
    "label": "פורטים",
    "text": "Test-NetConnection SERVER -Port 5985"
   }
  ],
  "guiSteps": [
   "במחשב היעד: services.msc ← Windows Remote Management ← Started + Automatic.",
   "חומת אש: Windows Remote Management (HTTP-In) מופעל.",
   "המשתמש צריך להיות חבר ב-Administrators או Remote Management Users."
  ],
  "ifNotWorking": "בדומיין השתמש בשם מחשב ולא ב-IP (Kerberos). עם IP נדרש TrustedHosts או HTTPS.",
  "notes": "TrustedHosts עם * חושף. הגדר שמות ספציפיים בלבד.",
  "tags": [
   "winrm",
   "powershell",
   "remoting",
   "psremoting",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "net-no-internet",
  "titleHe": "אין אינטרנט: בדיקה מדורגת",
  "titleEn": "No internet: step-by-step",
  "category": "Network",
  "symptom": "המחשב מחובר לרשת אבל אין גלישה.",
  "commands": [
   {
    "label": "פרטי כתובת",
    "text": "ipconfig /all"
   },
   {
    "label": "לולאת בדיקה",
    "text": "ping 127.0.0.1"
   },
   {
    "label": "Gateway",
    "text": "ping GATEWAY_IP"
   },
   {
    "label": "אינטרנט לפי IP",
    "text": "ping 8.8.8.8"
   },
   {
    "label": "אינטרנט לפי שם",
    "text": "ping google.com"
   },
   {
    "label": "מסלול",
    "text": "tracert 8.8.8.8"
   },
   {
    "label": "חידוש כתובת",
    "text": "ipconfig /release && ipconfig /renew"
   },
   {
    "label": "איפוס Winsock/IP (מחייב הפעלה מחדש)",
    "text": "netsh winsock reset & netsh int ip reset"
   }
  ],
  "guiSteps": [
   "תפור את הסדר: קישור פיזי ← IP ← Gateway ← IP חיצוני ← DNS.",
   "IP שמתחיל ב-169.254: אין DHCP.",
   "ping ל-IP עובד ושם לא: בעיית DNS (ראה DNS לא פותר שמות).",
   "ncpa.cpl ← כבה והפעל את הכרטיס. בדוק Proxy ב-inetcpl.cpl ← Connections."
  ],
  "ifNotWorking": "אם Gateway לא עונה: בדוק כבל, פורט בסוויץ׳, VLAN, והאם גם מחשבים אחרים בלי אינטרנט (אז הבעיה בראוטר/ספק).",
  "notes": "שמור את סדר הבדיקות, כך מוצאים את הנקודה שנשברה במקום לנחש.",
  "tags": [
   "internet",
   "אינטרנט",
   "ping",
   "network",
   "רשת",
   "dhcp",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "net-dhcp",
  "titleHe": "DHCP לא מקצה כתובות (169.254)",
  "titleEn": "DHCP not assigning addresses",
  "category": "Network",
  "symptom": "מחשבים מקבלים כתובת 169.254.x.x או \"Unidentified network\".",
  "commands": [
   {
    "label": "חידוש",
    "text": "ipconfig /renew"
   },
   {
    "label": "Scopes",
    "text": "Get-DhcpServerv4Scope"
   },
   {
    "label": "ניצול Scope",
    "text": "Get-DhcpServerv4ScopeStatistics"
   },
   {
    "label": "חכירות",
    "text": "Get-DhcpServerv4Lease -ScopeId 192.168.1.0 | Select IPAddress,ClientId,HostName,LeaseExpiryTime"
   },
   {
    "label": "האם השרת מורשה ב-AD",
    "text": "Get-DhcpServerInDC"
   }
  ],
  "guiSteps": [
   "dhcpmgmt.msc ← בדוק שה-Scope פעיל ושיש כתובות פנויות (Address Pool).",
   "השרת צריך להיות Authorized (קליק ימני על השרת ← Authorize).",
   "שירות DHCP Server רץ (services.msc).",
   "ב-VLAN נפרד נדרש DHCP Relay (IP Helper) בראוטר."
  ],
  "ifNotWorking": "אם ה-Scope מלא: קצר זמן חכירה, הרחב טווח או מחק חכירות ישנות. בדוק גם שרת DHCP כפול ברשת (Rogue DHCP).",
  "notes": "ראוטר ביתי שחובר בטעות לרשת מקצועית הוא סיבה קלאסית ל-Rogue DHCP.",
  "tags": [
   "dhcp",
   "169.254",
   "ip",
   "network",
   "wide"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "net-share-access",
  "titleHe": "אין גישה לתיקייה משותפת",
  "titleEn": "Cannot access shared folder",
  "category": "Network",
  "symptom": "שגיאה \"Access is denied\" או \"Network path not found\" בגישה ל-\\\\SERVER\\SHARE.",
  "commands": [
   {
    "label": "בדיקת נתיב",
    "text": "Test-Path \\\\SERVER\\SHARE"
   },
   {
    "label": "חיבור ידני",
    "text": "net use \\\\SERVER\\SHARE /user:DOMAIN\\USER"
   },
   {
    "label": "רשימת שיתופים בשרת",
    "text": "Get-SmbShare"
   },
   {
    "label": "הרשאות Share",
    "text": "Get-SmbShareAccess -Name SHARE"
   },
   {
    "label": "הרשאות NTFS",
    "text": "icacls D:\\Path"
   },
   {
    "label": "סשנים ופתוחים",
    "text": "Get-SmbSession; Get-SmbOpenFile"
   }
  ],
  "guiSteps": [
   "בדוק שהשם נפתר (nslookup) ושפורט 445 פתוח (Test-NetConnection SERVER -Port 445).",
   "Properties של התיקייה ← Sharing ← Advanced Sharing ← Permissions.",
   "Properties ← Security ← Advanced ← Effective Access: בחר משתמש ובדוק.",
   "fsmgmt.msc ← Sessions / Open Files: מי מחובר ומי נועל קבצים."
  ],
  "ifNotWorking": "Path not found: DNS/פורט. Access denied: הרשאות או חשבון שגוי שנשמר ב-Credential Manager.",
  "notes": "תמיד בדוק את שני הצדדים: הרשאות ה-Share והרשאות ה-NTFS. המגבילה מהשתיים קובעת.",
  "tags": [
   "share",
   "שיתוף",
   "smb",
   "access denied",
   "permissions",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "net-port-test",
  "titleHe": "בדיקת פורט ותהליך מאזין",
  "titleEn": "Port check / who is listening",
  "category": "Network",
  "symptom": "שירות לא נגיש, או רוצים לדעת מי תפס פורט.",
  "commands": [
   {
    "label": "בדיקה מרחוק",
    "text": "Test-NetConnection HOST -Port 443"
   },
   {
    "label": "מאזינים מקומיים",
    "text": "netstat -ano | findstr LISTENING"
   },
   {
    "label": "פורט ספציפי",
    "text": "netstat -ano | findstr :8080"
   },
   {
    "label": "מי התהליך",
    "text": "tasklist /fi \"pid eq PID\""
   },
   {
    "label": "PowerShell",
    "text": "Get-NetTCPConnection -LocalPort 8080 | Select State,OwningProcess"
   }
  ],
  "guiSteps": [
   "Resource Monitor (resmon) ← Network ← Listening Ports.",
   "אם הפורט סגור מרחוק ופתוח מקומית: חומת אש בשרת או בדרך."
  ],
  "ifNotWorking": "פתוח מקומית ולא מרחוק: בדוק Windows Firewall (wf.msc) ו-Security Group בענן/חומת אש.",
  "notes": "Test-NetConnection הוא תחליף ל-telnet.",
  "tags": [
   "port",
   "פורט",
   "netstat",
   "firewall",
   "tcp"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "net-wifi",
  "titleHe": "בעיות Wi-Fi",
  "titleEn": "Wi-Fi problems",
  "category": "Network",
  "symptom": "נותק, איטי או לא מצליח להתחבר לרשת אלחוטית.",
  "commands": [
   {
    "label": "מצב החיבור",
    "text": "netsh wlan show interfaces"
   },
   {
    "label": "דוח Wi-Fi",
    "text": "netsh wlan show wlanreport"
   },
   {
    "label": "רשתות שמורות",
    "text": "netsh wlan show profiles"
   },
   {
    "label": "שכח רשת",
    "text": "netsh wlan delete profile name=\"SSID\""
   },
   {
    "label": "איפוס רשת",
    "text": "netsh winsock reset & netsh int ip reset & ipconfig /flushdns"
   }
  ],
  "guiSteps": [
   "הגדרות ← Network ← Wi-Fi ← Forget ← התחבר מחדש.",
   "devmgmt.msc ← Network adapters ← עדכן/החזר דרייבר.",
   "בדוק עוצמת אות ורצועה (2.4/5GHz) ואם רק המחשב הזה סובל."
  ],
  "ifNotWorking": "אם נכשל רק מול רשת ארגונית (802.1X): בדוק תעודת המחשב (certlm.msc) ועדכון NPS/RADIUS.",
  "notes": "wlanreport.html נשמר ב-C:\\ProgramData\\Microsoft\\Windows\\WlanReport.",
  "tags": [
   "wifi",
   "wireless",
   "אלחוט",
   "network",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "net-firewall",
  "titleHe": "חומת אש חוסמת תקשורת",
  "titleEn": "Firewall blocks traffic",
  "category": "Network",
  "symptom": "שירות פעיל אבל לא נגיש מהרשת.",
  "commands": [
   {
    "label": "מצב פרופילים",
    "text": "netsh advfirewall show allprofiles"
   },
   {
    "label": "כללי חסימה",
    "text": "Get-NetFirewallRule -Action Block -Enabled True | Select DisplayName,Direction,Profile"
   },
   {
    "label": "פתיחת פורט",
    "text": "New-NetFirewallRule -DisplayName \"Allow TCP 8080\" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow"
   },
   {
    "label": "לוג חסימות",
    "text": "netsh advfirewall set currentprofile logging droppedconnections enable"
   }
  ],
  "guiSteps": [
   "wf.msc ← Inbound Rules ← חפש את השירות או הפורט.",
   "ודא שהכלל מתאים לפרופיל (Domain/Private/Public).",
   "כיבוי זמני רק לבדיקה: firewall.cpl ← Turn Windows Defender Firewall on or off. החזר מייד!"
  ],
  "ifNotWorking": "לוג החסימות ב-C:\\Windows\\System32\\LogFiles\\Firewall\\pfirewall.log מראה מה נחסם.",
  "notes": "כיבוי חומת אש לצורך אבחון: רק למשך דקות וברשת מוגנת.",
  "tags": [
   "firewall",
   "חומת אש",
   "port",
   "block",
   "network"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "print-spooler",
  "titleHe": "תור הדפסה תקוע",
  "titleEn": "Print queue stuck",
  "category": "Printers",
  "symptom": "מסמך תקוע ב-Deleting או Printing ואי אפשר לבטל.",
  "commands": [
   {
    "label": "עצירת Spooler",
    "text": "net stop spooler"
   },
   {
    "label": "ניקוי התור",
    "text": "del /Q /F /S \"%systemroot%\\System32\\spool\\PRINTERS\\*.*\""
   },
   {
    "label": "הפעלה",
    "text": "net start spooler"
   },
   {
    "label": "PowerShell",
    "text": "Restart-Service Spooler -Force"
   }
  ],
  "guiSteps": [
   "services.msc ← Print Spooler ← Stop.",
   "פתח C:\\Windows\\System32\\spool\\PRINTERS ← מחק את כל הקבצים.",
   "Start Print Spooler ← נסה להדפיס דף בדיקה."
  ],
  "ifNotWorking": "אם חוזר: דרייבר פגום או מסמך ענק. הסר את הדרייבר (printui /s /t2) והתקן גרסה תקינה.",
  "notes": "בשרת הדפסה זה משפיע על כל המשתמשים. הודע לפני.",
  "tags": [
   "printer",
   "מדפסת",
   "spooler",
   "queue",
   "print",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "print-driver",
  "titleHe": "דרייבר מדפסת / שגיאות התקנה",
  "titleEn": "Printer driver / install errors",
  "category": "Printers",
  "symptom": "מדפסת לא מתחברת. שגיאות 0x0000011b, 0x00000709, 0x00000bcb.",
  "commands": [
   {
    "label": "דרייברים מותקנים",
    "text": "Get-PrinterDriver | Select Name,Manufacturer"
   },
   {
    "label": "חיבור למדפסת משותפת",
    "text": "Add-Printer -ConnectionName \\\\PRINTSERVER\\PRINTER"
   },
   {
    "label": "מאפייני שרת הדפסה",
    "text": "printui /s /t2"
   },
   {
    "label": "הסרת דרייבר",
    "text": "Remove-PrinterDriver -Name \"DRIVER NAME\""
   },
   {
    "label": "תיקון 0x11b (זמני)",
    "text": "reg add \"HKLM\\SYSTEM\\CurrentControlSet\\Control\\Print\" /v RpcAuthnLevelPrivacyEnabled /t REG_DWORD /d 0 /f"
   }
  ],
  "guiSteps": [
   "control printers ← Add a printer ← The printer that I want isn't listed ← Select a shared printer by name.",
   "printui /s /t2 ← Drivers ← Remove ← Remove driver and driver package ← הוסף מחדש.",
   "printmanagement.msc לניהול מדפסות ודרייברים מרכזי."
  ],
  "ifNotWorking": "0x11b: בעיית אבטחת RPC אחרי עדכון. ההגדרה בריגסטרי ב*שרת ההדפסה* מחזירה, אבל מחלישה הצפנה. עדיף עדכון/הגדרת Windows תואמת.",
  "notes": "שנה את הריגסטרי רק אם אין ברירה ותעד. אחרי פתרון חזור להגדרה המקורית.",
  "tags": [
   "printer",
   "driver",
   "דרייבר",
   "0x11b",
   "print",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "print-offline",
  "titleHe": "מדפסת במצב Offline",
  "titleEn": "Printer shows offline",
  "category": "Printers",
  "symptom": "המדפסת מופיעה \"Offline\" למרות שהיא דלוקה.",
  "commands": [
   {
    "label": "סטטוס",
    "text": "Get-Printer | Select Name,PrinterStatus,PortName"
   },
   {
    "label": "פורטים",
    "text": "Get-PrinterPort | Select Name,PrinterHostAddress"
   },
   {
    "label": "בדיקת ping",
    "text": "ping PRINTER_IP"
   },
   {
    "label": "הדפסת דף בדיקה",
    "text": "rundll32 printui.dll,PrintUIEntry /k /n \"PRINTER\""
   }
  ],
  "guiSteps": [
   "control printers ← קליק ימני ← See what's printing ← Printer ← בטל Use Printer Offline.",
   "Printer Properties ← Ports ← ודא שכתובת ה-IP נכונה (המדפסת יכולה לקבל כתובת חדשה מ-DHCP).",
   "במאפייני הפורט כבה SNMP Status Enabled אם הסטטוס שגוי."
  ],
  "ifNotWorking": "שריין כתובת IP למדפסת (DHCP reservation) כדי שהכתובת לא תשתנה.",
  "notes": "אם רק משתמש אחד רואה Offline: מחק והתקן מחדש את המדפסת אצלו.",
  "tags": [
   "printer",
   "offline",
   "ip",
   "print",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "sys-slow",
  "titleHe": "מחשב איטי",
  "titleEn": "Slow computer",
  "category": "System",
  "symptom": "המחשב איטי, תקוע או מאוד חם.",
  "commands": [
   {
    "label": "תהליכים לפי CPU",
    "text": "Get-Process | Sort CPU -Descending | Select -First 10 Name,CPU,Id"
   },
   {
    "label": "זיכרון פנוי",
    "text": "Get-CimInstance Win32_OperatingSystem | Select @{n=\"FreeGB\";e={[math]::Round($_.FreePhysicalMemory/1MB,1)}}"
   },
   {
    "label": "מצב דיסק",
    "text": "Get-PhysicalDisk | Select FriendlyName,HealthStatus,OperationalStatus"
   },
   {
    "label": "פרופיל אתחול",
    "text": "Get-CimInstance Win32_StartupCommand | Select Name,Command"
   }
  ],
  "guiSteps": [
   "taskmgr ← Processes: מיין לפי CPU, Memory, Disk.",
   "Startup apps: בטל מיותרים. resmon ← Disk: מי קורא/כותב.",
   "בדוק מקום פנוי בדיסק, עדכונים שרצים, אנטי-וירוס שסורק.",
   "devmgmt.msc ← חפש התקנים עם סימן אזהרה."
  ],
  "ifNotWorking": "דיסק 100%: בדוק S.M.A.R.T, עדכוני Windows ותוכנות סנכרון. זיכרון מלא: הוסף RAM או סגור תוכנות.",
  "notes": "מכונה ישנה עם HDD רגיל תרוויח הרבה מהחלפה ל-SSD.",
  "tags": [
   "slow",
   "איטי",
   "cpu",
   "ram",
   "disk",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "sys-sfc",
  "titleHe": "תיקון קבצי מערכת (SFC / DISM)",
  "titleEn": "System file repair (SFC / DISM)",
  "category": "System",
  "symptom": "קריסות, שגיאות מוזרות או רכיב Windows שלא עובד.",
  "commands": [
   {
    "label": "שלב 1: תיקון תמונת המערכת",
    "text": "DISM /Online /Cleanup-Image /RestoreHealth"
   },
   {
    "label": "שלב 2: בדיקת קבצים",
    "text": "sfc /scannow"
   },
   {
    "label": "בדיקת דיסק",
    "text": "chkdsk C: /scan"
   },
   {
    "label": "בדיקת דיסק עם תיקון (דורש הפעלה מחדש)",
    "text": "chkdsk C: /f /r"
   }
  ],
  "guiSteps": [
   "הפעל CMD כמנהל.",
   "הרץ קודם DISM ואחריו sfc /scannow.",
   "הלוג של SFC ב-C:\\Windows\\Logs\\CBS\\CBS.log.",
   "הפעל מחדש ובדוק."
  ],
  "ifNotWorking": "אם DISM נכשל: השתמש ב-Source (ISO): DISM /Online /Cleanup-Image /RestoreHealth /Source:WIM:D:\\sources\\install.wim:1 /LimitAccess.",
  "notes": "chkdsk /r על דיסק גדול לוקח שעות. תכנן.",
  "tags": [
   "sfc",
   "dism",
   "corrupt",
   "system files",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "sys-bsod",
  "titleHe": "מסך כחול (BSOD)",
  "titleEn": "Blue screen (BSOD)",
  "category": "System",
  "symptom": "המחשב קורס עם קוד שגיאה, ומתאתחל.",
  "commands": [
   {
    "label": "אירועי קריסה",
    "text": "Get-WinEvent -FilterHashtable @{LogName='System';Id=41,1001} -MaxEvents 10 | Select TimeCreated,Id,Message"
   },
   {
    "label": "קבצי Dump",
    "text": "dir C:\\Windows\\Minidump"
   },
   {
    "label": "בדיקת זיכרון",
    "text": "mdsched"
   },
   {
    "label": "בדיקת קבצים",
    "text": "sfc /scannow"
   }
  ],
  "guiSteps": [
   "רשום את קוד העצירה (למשל IRQL_NOT_LESS_OR_EQUAL, PAGE_FAULT) ושם הדרייבר אם מוצג.",
   "eventvwr.msc ← Windows Logs ← System ← Event 41 (Kernel-Power) ו-1001 (BugCheck).",
   "פתח Minidump ב-WinDbg או BlueScreenView.",
   "עדכן/החזר דרייבר אחרון (devmgmt.msc ← Roll Back Driver). הרץ mdsched לבדיקת זיכרון."
  ],
  "ifNotWorking": "אם מתרחש אחרי עדכון: הסר את העדכון (Settings ← Update history ← Uninstall updates). אם חוזר בלי קשר: חשד לחומרה (RAM/דיסק).",
  "notes": "שמור קובץ dump לפני ניקוי. רק מי שמנתח אותו יכול לדעת את הסיבה האמיתית.",
  "tags": [
   "bsod",
   "blue screen",
   "מסך כחול",
   "crash",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "sys-update",
  "titleHe": "Windows Update תקוע",
  "titleEn": "Windows Update stuck / failing",
  "category": "System",
  "symptom": "עדכון נכשל, תקוע בהורדה או \"We couldn't complete the updates\".",
  "commands": [
   {
    "label": "עצירת שירותים",
    "text": "net stop wuauserv & net stop bits & net stop cryptsvc"
   },
   {
    "label": "איפוס מטמון (גיבוי שם)",
    "text": "ren C:\\Windows\\SoftwareDistribution SoftwareDistribution.old & ren C:\\Windows\\System32\\catroot2 catroot2.old"
   },
   {
    "label": "הפעלה",
    "text": "net start cryptsvc & net start bits & net start wuauserv"
   },
   {
    "label": "בדיקת תיקון",
    "text": "DISM /Online /Cleanup-Image /RestoreHealth"
   },
   {
    "label": "סריקה",
    "text": "usoclient StartScan"
   }
  ],
  "guiSteps": [
   "Settings ← Update ← Troubleshoot ← Windows Update.",
   "בדוק שיש מקום פנוי (לפחות 15GB).",
   "הרץ DISM ו-SFC. אם נכשל עדכון מסוים: הורד אותו ידנית מ-Microsoft Update Catalog (KB)."
  ],
  "ifNotWorking": "שגיאות WSUS: בדוק GPO של שרת העדכונים (gpresult) וגישה לשרת.",
  "notes": "אל תמחק את SoftwareDistribution, שנה שם כדי שתוכל לשחזר.",
  "tags": [
   "update",
   "עדכון",
   "windows update",
   "wsus",
   "kb",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "sys-disk-full",
  "titleHe": "דיסק מלא",
  "titleEn": "Disk full",
  "category": "System",
  "symptom": "C: מלא, חסר מקום לעדכונים או לתוכנות.",
  "commands": [
   {
    "label": "מקום פנוי",
    "text": "Get-PSDrive C"
   },
   {
    "label": "תיקיות גדולות",
    "text": "Get-ChildItem C:\\ -Directory | ForEach-Object { [pscustomobject]@{Name=$_.Name; GB=[math]::Round((Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure Length -Sum).Sum/1GB,2)} } | Sort GB -Descending"
   },
   {
    "label": "ניקוי רכיבי עדכון",
    "text": "DISM /Online /Cleanup-Image /StartComponentCleanup"
   },
   {
    "label": "Disk Cleanup",
    "text": "cleanmgr /sageset:1 & cleanmgr /sagerun:1"
   }
  ],
  "guiSteps": [
   "cleanmgr ← Clean up system files ← סמן Windows Update Cleanup, Temporary files.",
   "Settings ← System ← Storage ← Storage Sense.",
   "נקה %temp% וסל מחזור, ובדוק תיקיית פרופילים/קבצי PST גדולים.",
   "כלים כמו WinDirStat מראים מי תופס."
  ],
  "ifNotWorking": "אם שרת: בדוק יומני אירועים, גיבויים ו-Shadow Copies (vssadmin list shadowstorage).",
  "notes": "אל תמחק קבצים מ-C:\\Windows ידנית.",
  "tags": [
   "disk",
   "דיסק",
   "space",
   "storage",
   "cleanup",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "sys-event-ids",
  "titleHe": "מזהי Event חשובים",
  "titleEn": "Important Event IDs",
  "category": "System",
  "symptom": "מה לחפש ב-Event Viewer כשבודקים כניסות, נעילות ושינויים.",
  "commands": [
   {
    "label": "כשלי התחברות",
    "text": "Get-WinEvent -FilterHashtable @{LogName='Security';Id=4625} -MaxEvents 10 | Select TimeCreated,Message"
   },
   {
    "label": "התחברויות מוצלחות",
    "text": "Get-WinEvent -FilterHashtable @{LogName='Security';Id=4624} -MaxEvents 10"
   },
   {
    "label": "נעילת חשבון",
    "text": "Get-WinEvent -FilterHashtable @{LogName='Security';Id=4740} -MaxEvents 10"
   },
   {
    "label": "כיבוי/אתחול",
    "text": "Get-WinEvent -FilterHashtable @{LogName='System';Id=1074,6005,6006,41} -MaxEvents 15"
   }
  ],
  "guiSteps": [
   "4624 כניסה הצליחה. 4625 כניסה נכשלה. 4634/4647 יציאה.",
   "4720 משתמש נוצר. 4722 הופעל. 4725 הושבת. 4726 נמחק. 4723/4724 שינוי/איפוס סיסמה. 4740 נעילה.",
   "4728/4732/4756 הוספה לקבוצה. 4768/4769/4771 Kerberos. 4776 אימות NTLM.",
   "1074 כיבוי יזום. 6005/6006 שירות Event Log התחיל/נעצר. 41 כיבוי לא תקין.",
   "7036 שירות שינה מצב. 7034 שירות קרס."
  ],
  "ifNotWorking": "ל-4625 הסתכל ב-Status/SubStatus: 0xC000006A סיסמה שגויה, 0xC0000234 נעול, 0xC0000072 מושבת.",
  "notes": "בדומיין רוב אירועי האבטחה מצטברים ב-DC. חפש שם.",
  "tags": [
   "event",
   "log",
   "יומן",
   "4625",
   "4740",
   "4624",
   "audit",
   "wide"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "sys-bitlocker",
  "titleHe": "BitLocker: מפתח שחזור",
  "titleEn": "BitLocker recovery key",
  "category": "System",
  "symptom": "המחשב מבקש מפתח שחזור BitLocker באתחול.",
  "commands": [
   {
    "label": "מצב",
    "text": "manage-bde -status"
   },
   {
    "label": "מפתחות",
    "text": "manage-bde -protectors -get C:"
   },
   {
    "label": "מפתח מ-AD",
    "text": "Get-ADObject -Filter {objectClass -eq \"msFVE-RecoveryInformation\"} -SearchBase (Get-ADComputer COMPUTER).DistinguishedName -Properties msFVE-RecoveryPassword | Select Name,msFVE-RecoveryPassword"
   },
   {
    "label": "השעיית הגנה לפני עדכון BIOS",
    "text": "manage-bde -protectors -disable C: -RebootCount 1"
   }
  ],
  "guiSteps": [
   "ב-dsa.msc ← המחשב ← Properties ← לשונית BitLocker Recovery.",
   "התאם את Password ID שמוצג במסך למפתח הנכון.",
   "מחשב מבוטל? בדוק גם ב-Microsoft Account או Entra ID.",
   "אחרי כניסה: manage-bde -protectors -get C: ובדוק שהכל תקין, ושקודם שינוי BIOS/TPM."
  ],
  "ifNotWorking": "אם המפתח לא קיים ב-AD: בלי המפתח אין שחזור. כך שאסור להתחיל בלי גיבוי מפתחות מראש.",
  "notes": "הפעל גיבוי מפתחות ל-AD ב-GPO לפני הצפנת כל המחשבים.",
  "tags": [
   "bitlocker",
   "recovery",
   "שחזור",
   "encryption",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "sys-outlook",
  "titleHe": "Outlook לא נפתח / פרופיל תקול",
  "titleEn": "Outlook won't open / bad profile",
  "category": "System",
  "symptom": "Outlook נתקע על Loading profile, קורס, או מבקש סיסמה שוב ושוב.",
  "commands": [
   {
    "label": "מצב בטוח",
    "text": "outlook.exe /safe"
   },
   {
    "label": "איפוס חלונית ניווט",
    "text": "outlook.exe /resetnavpane"
   },
   {
    "label": "איפוס תצוגות",
    "text": "outlook.exe /cleanviews"
   },
   {
    "label": "פרופילים",
    "text": "control mlcfg32.cpl"
   },
   {
    "label": "בדיקת קבצי PST",
    "text": "dir \"%localappdata%\\Microsoft\\Outlook\""
   }
  ],
  "guiSteps": [
   "סגור Outlook לגמרי (taskkill /f /im outlook.exe).",
   "פתח במצב בטוח: Win+R ← outlook.exe /safe. אם עובד: בטל תוספים (File ← Options ← Add-ins).",
   "Control Panel ← Mail ← Show Profiles ← צור פרופיל חדש.",
   "נקה סיסמאות שמורות ב-Credential Manager."
  ],
  "ifNotWorking": "אם PST פגום: scanpst.exe (תחת Office). עבור Exchange/365 מחק את קובץ ה-OST והוא יסתנכרן מחדש.",
  "notes": "לפני מחיקת קבצים גבה את ה-PST. ב-OST מחיקה בטוחה (הכל מהשרת).",
  "tags": [
   "outlook",
   "office",
   "mail",
   "מייל",
   "profile",
   "single"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-compmgmt-msc",
  "titleHe": "ניהול מחשב",
  "titleEn": "Computer Management",
  "category": "Win+R",
  "symptom": "מרכז: משתמשים מקומיים, שירותים, דיסקים, יומן אירועים, התקנים.",
  "commands": [
   {
    "label": "Win+R",
    "text": "compmgmt.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד compmgmt.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "compmgmt.msc",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-devmgmt-msc",
  "titleHe": "מנהל התקנים",
  "titleEn": "Device Manager",
  "category": "Win+R",
  "symptom": "דרייברים, התקן עם סימן אזהרה, החזרת דרייבר, חיפוש חומרה.",
  "commands": [
   {
    "label": "Win+R",
    "text": "devmgmt.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד devmgmt.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "devmgmt.msc",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-diskmgmt-msc",
  "titleHe": "ניהול דיסקים",
  "titleEn": "Disk Management",
  "category": "Win+R",
  "symptom": "מחיצות, אותיות כונן, הוספת דיסק, הרחבת/כיווץ ווליום.",
  "commands": [
   {
    "label": "Win+R",
    "text": "diskmgmt.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד diskmgmt.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "diskmgmt.msc",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-services-msc",
  "titleHe": "שירותים",
  "titleEn": "Services",
  "category": "Win+R",
  "symptom": "הפעלה/עצירה של שירות, סוג הפעלה (Automatic/Manual), חשבון הרצה.",
  "commands": [
   {
    "label": "Win+R",
    "text": "services.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד services.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "services.msc",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-eventvwr-msc",
  "titleHe": "יומן אירועים",
  "titleEn": "Event Viewer",
  "category": "Win+R",
  "symptom": "שגיאות וקריסות. Windows Logs ← System/Application/Security.",
  "commands": [
   {
    "label": "Win+R",
    "text": "eventvwr.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד eventvwr.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "eventvwr.msc",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-taskschd-msc",
  "titleHe": "מתזמן משימות",
  "titleEn": "Task Scheduler",
  "category": "Win+R",
  "symptom": "משימות מתוזמנות: בדיקה, הרצה ידנית, בדיקת הרשאות.",
  "commands": [
   {
    "label": "Win+R",
    "text": "taskschd.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד taskschd.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "taskschd.msc",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-taskmgr",
  "titleHe": "מנהל המשימות",
  "titleEn": "Task Manager",
  "category": "Win+R",
  "symptom": "תהליכים, ביצועים, משתמשים (ב-Terminal Server), סטארטאפ. קיצור: Ctrl+Shift+Esc.",
  "commands": [
   {
    "label": "Win+R",
    "text": "taskmgr"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד taskmgr ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "taskmgr"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-resmon",
  "titleHe": "ניטור משאבים",
  "titleEn": "Resource Monitor",
  "category": "Win+R",
  "symptom": "מי קורא/כותב לדיסק, איזה תהליך על איזה פורט, זיכרון בפירוט.",
  "commands": [
   {
    "label": "Win+R",
    "text": "resmon"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד resmon ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "resmon",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-perfmon",
  "titleHe": "מוניטור ביצועים",
  "titleEn": "Performance Monitor",
  "category": "Win+R",
  "symptom": "מונים, Data Collector Sets ודוח /report של 60 שניות.",
  "commands": [
   {
    "label": "Win+R",
    "text": "perfmon"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד perfmon ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "perfmon",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-msconfig",
  "titleHe": "תצורת מערכת",
  "titleEn": "System Configuration",
  "category": "Win+R",
  "symptom": "אתחול בטוח, שירותים ואתחול, אפשרויות Boot.",
  "commands": [
   {
    "label": "Win+R",
    "text": "msconfig"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד msconfig ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "msconfig",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-msinfo32",
  "titleHe": "מידע על המערכת",
  "titleEn": "System Information",
  "category": "Win+R",
  "symptom": "חומרה, גרסת BIOS, דרייברים, מידע מקיף שניתן לייצא.",
  "commands": [
   {
    "label": "Win+R",
    "text": "msinfo32"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד msinfo32 ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "msinfo32"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-regedit",
  "titleHe": "עורך הרישום",
  "titleEn": "Registry Editor",
  "category": "Win+R",
  "symptom": "שינוי ריגסטרי. גבה (File ← Export) לפני שינוי.",
  "commands": [
   {
    "label": "Win+R",
    "text": "regedit"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד regedit ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "regedit",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-cleanmgr",
  "titleHe": "ניקוי דיסק",
  "titleEn": "Disk Cleanup",
  "category": "Win+R",
  "symptom": "פינוי מקום: Windows Update Cleanup, קבצים זמניים.",
  "commands": [
   {
    "label": "Win+R",
    "text": "cleanmgr"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד cleanmgr ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "cleanmgr",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-mdsched",
  "titleHe": "אבחון זיכרון",
  "titleEn": "Windows Memory Diagnostic",
  "category": "Win+R",
  "symptom": "בדיקת RAM בהפעלה הבאה (מחשב קורס/מסך כחול).",
  "commands": [
   {
    "label": "Win+R",
    "text": "mdsched"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד mdsched ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "mdsched",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-lusrmgr-msc",
  "titleHe": "משתמשים וקבוצות מקומיים",
  "titleEn": "Local Users and Groups",
  "category": "Win+R",
  "symptom": "אדמין מקומי, הוספת משתמש לקבוצת Administrators או Remote Desktop Users.",
  "commands": [
   {
    "label": "Win+R",
    "text": "lusrmgr.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד lusrmgr.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "lusrmgr.msc",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-netplwiz",
  "titleHe": "חשבונות משתמש / כניסה אוטומטית",
  "titleEn": "User Accounts (netplwiz)",
  "category": "Win+R",
  "symptom": "ניהול משתמשים והפעלת כניסה אוטומטית. גם: control userpasswords2.",
  "commands": [
   {
    "label": "Win+R",
    "text": "netplwiz"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד netplwiz ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "netplwiz"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-secpol-msc",
  "titleHe": "מדיניות אבטחה מקומית",
  "titleEn": "Local Security Policy",
  "category": "Win+R",
  "symptom": "מדיניות סיסמאות מקומית, הרשאות, Audit.",
  "commands": [
   {
    "label": "Win+R",
    "text": "secpol.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד secpol.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "secpol.msc",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-gpedit-msc",
  "titleHe": "מדיניות קבוצה מקומית",
  "titleEn": "Local Group Policy Editor",
  "category": "Win+R",
  "symptom": "הגדרות GPO מקומיות. לא קיים בגרסת Home.",
  "commands": [
   {
    "label": "Win+R",
    "text": "gpedit.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד gpedit.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "gpedit.msc",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-certmgr-msc",
  "titleHe": "תעודות משתמש",
  "titleEn": "Certificates (User)",
  "category": "Win+R",
  "symptom": "תעודות של המשתמש הנוכחי.",
  "commands": [
   {
    "label": "Win+R",
    "text": "certmgr.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד certmgr.msc ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "certmgr.msc"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-certlm-msc",
  "titleHe": "תעודות מחשב",
  "titleEn": "Certificates (Local Machine)",
  "category": "Win+R",
  "symptom": "תעודות של המחשב: Wi-Fi 802.1X, RDP, שרת.",
  "commands": [
   {
    "label": "Win+R",
    "text": "certlm.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד certlm.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "certlm.msc",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-fsmgmt-msc",
  "titleHe": "תיקיות משותפות",
  "titleEn": "Shared Folders",
  "category": "Win+R",
  "symptom": "שיתופים, Sessions, Open Files: מי מחובר ואילו קבצים נעולים.",
  "commands": [
   {
    "label": "Win+R",
    "text": "fsmgmt.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד fsmgmt.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "fsmgmt.msc",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-dsa-msc",
  "titleHe": "משתמשים ומחשבים ב-AD",
  "titleEn": "AD Users and Computers (ADUC)",
  "category": "Win+R",
  "symptom": "שחרור נעילה, איפוס סיסמה, קבוצות, OU.",
  "commands": [
   {
    "label": "Win+R",
    "text": "dsa.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד dsa.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש RSAT או שרת Windows. דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "dsa.msc",
   "RSAT admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-gpmc-msc",
  "titleHe": "ניהול מדיניות קבוצה",
  "titleEn": "Group Policy Management",
  "category": "Win+R",
  "symptom": "GPO, קישור ל-OU, Group Policy Results/Modeling, גיבוי.",
  "commands": [
   {
    "label": "Win+R",
    "text": "gpmc.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד gpmc.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש RSAT או שרת Windows. דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "gpmc.msc",
   "RSAT admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-dnsmgmt-msc",
  "titleHe": "ניהול DNS",
  "titleEn": "DNS Manager",
  "category": "Win+R",
  "symptom": "Zones, רשומות A/SRV, Forwarders, Scavenging.",
  "commands": [
   {
    "label": "Win+R",
    "text": "dnsmgmt.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד dnsmgmt.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש RSAT או שרת Windows. דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "dnsmgmt.msc",
   "RSAT admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-dhcpmgmt-msc",
  "titleHe": "ניהול DHCP",
  "titleEn": "DHCP Manager",
  "category": "Win+R",
  "symptom": "Scopes, חכירות, שריונות, הרשאת שרת.",
  "commands": [
   {
    "label": "Win+R",
    "text": "dhcpmgmt.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד dhcpmgmt.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש RSAT או שרת Windows. דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "dhcpmgmt.msc",
   "RSAT admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-dssite-msc",
  "titleHe": "אתרים ושירותים ב-AD",
  "titleEn": "AD Sites and Services",
  "category": "Win+R",
  "symptom": "Sites, Subnets, חיבורי רפליקציה.",
  "commands": [
   {
    "label": "Win+R",
    "text": "dssite.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד dssite.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש RSAT או שרת Windows. דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "dssite.msc",
   "RSAT admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-domain-msc",
  "titleHe": "דומיינים ויחסי אמון",
  "titleEn": "AD Domains and Trusts",
  "category": "Win+R",
  "symptom": "Trusts, מצב רמת דומיין/יער.",
  "commands": [
   {
    "label": "Win+R",
    "text": "domain.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד domain.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש RSAT או שרת Windows. דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "domain.msc",
   "RSAT admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-adsiedit-msc",
  "titleHe": "ADSI Edit",
  "titleEn": "ADSI Edit",
  "category": "Win+R",
  "symptom": "עריכת מאפייני AD ברמה נמוכה. זהירות!",
  "commands": [
   {
    "label": "Win+R",
    "text": "adsiedit.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד adsiedit.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש RSAT או שרת Windows. דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "adsiedit.msc",
   "RSAT admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-rsop-msc",
  "titleHe": "Resultant Set of Policy",
  "titleEn": "RSoP",
  "category": "Win+R",
  "symptom": "איזה GPO חל בפועל על המשתמש והמחשב.",
  "commands": [
   {
    "label": "Win+R",
    "text": "rsop.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד rsop.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "rsop.msc",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-ncpa-cpl",
  "titleHe": "חיבורי רשת",
  "titleEn": "Network Connections",
  "category": "Win+R",
  "symptom": "הגדרות IP/DNS של כרטיס, כיבוי/הפעלה של כרטיס.",
  "commands": [
   {
    "label": "Win+R",
    "text": "ncpa.cpl"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד ncpa.cpl ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "ncpa.cpl"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-firewall-cpl",
  "titleHe": "חומת אש",
  "titleEn": "Windows Firewall",
  "category": "Win+R",
  "symptom": "מצב חומת אש והרשאת אפליקציות.",
  "commands": [
   {
    "label": "Win+R",
    "text": "firewall.cpl"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד firewall.cpl ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "firewall.cpl"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-wf-msc",
  "titleHe": "חומת אש מתקדמת",
  "titleEn": "Firewall with Advanced Security",
  "category": "Win+R",
  "symptom": "כללי Inbound/Outbound ופרופילים.",
  "commands": [
   {
    "label": "Win+R",
    "text": "wf.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד wf.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "wf.msc",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-mstsc",
  "titleHe": "חיבור שולחן עבודה מרוחק",
  "titleEn": "Remote Desktop Connection",
  "category": "Win+R",
  "symptom": "RDP. mstsc /v:SERVER /admin לחיבור קונסול, mstsc /shadow:ID לצפייה בסשן.",
  "commands": [
   {
    "label": "Win+R",
    "text": "mstsc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד mstsc ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "mstsc"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-msra",
  "titleHe": "עזרה מרחוק",
  "titleEn": "Remote Assistance",
  "category": "Win+R",
  "symptom": "סיוע מרחוק למשתמש בתוך הרשת.",
  "commands": [
   {
    "label": "Win+R",
    "text": "msra"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד msra ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "msra"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-inetcpl-cpl",
  "titleHe": "אפשרויות אינטרנט",
  "titleEn": "Internet Options",
  "category": "Win+R",
  "symptom": "Proxy, אבטחה, תעודות ובדיקות Explorer ישנות.",
  "commands": [
   {
    "label": "Win+R",
    "text": "inetcpl.cpl"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד inetcpl.cpl ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "inetcpl.cpl"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-printmanagement-msc",
  "titleHe": "ניהול הדפסה",
  "titleEn": "Print Management",
  "category": "Win+R",
  "symptom": "שרתי הדפסה, דרייברים, תורים מרכזית.",
  "commands": [
   {
    "label": "Win+R",
    "text": "printmanagement.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד printmanagement.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש RSAT או שרת Windows. דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "printmanagement.msc",
   "RSAT admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-control-printers",
  "titleHe": "מדפסות והתקנים",
  "titleEn": "Devices and Printers",
  "category": "Win+R",
  "symptom": "הוספה/הסרה/תור של מדפסות.",
  "commands": [
   {
    "label": "Win+R",
    "text": "control printers"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד control printers ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "control printers"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-appwiz-cpl",
  "titleHe": "תוכנות ותכונות",
  "titleEn": "Programs and Features",
  "category": "Win+R",
  "symptom": "הסרת תוכנה והצגת עדכונים מותקנים.",
  "commands": [
   {
    "label": "Win+R",
    "text": "appwiz.cpl"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד appwiz.cpl ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "appwiz.cpl"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-optionalfeatures",
  "titleHe": "תכונות Windows",
  "titleEn": "Windows Features",
  "category": "Win+R",
  "symptom": "הפעלת Hyper-V, .NET, Telnet client, Windows Sandbox.",
  "commands": [
   {
    "label": "Win+R",
    "text": "optionalfeatures"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד optionalfeatures ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "optionalfeatures",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-sysdm-cpl",
  "titleHe": "מאפייני מערכת",
  "titleEn": "System Properties",
  "category": "Win+R",
  "symptom": "שם מחשב, הצטרפות לדומיין, Remote, משתני סביבה, Performance.",
  "commands": [
   {
    "label": "Win+R",
    "text": "sysdm.cpl"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד sysdm.cpl ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "sysdm.cpl",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-control-admintools",
  "titleHe": "כלי ניהול",
  "titleEn": "Administrative Tools",
  "category": "Win+R",
  "symptom": "כל כלי הניהול במקום אחד.",
  "commands": [
   {
    "label": "Win+R",
    "text": "control admintools"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד control admintools ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "control admintools"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-ms-settings-windowsupdate",
  "titleHe": "Windows Update (הגדרות)",
  "titleEn": "Windows Update settings",
  "category": "Win+R",
  "symptom": "מסך העדכונים בהגדרות.",
  "commands": [
   {
    "label": "Win+R",
    "text": "ms-settings:windowsupdate"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד ms-settings:windowsupdate ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "ms-settings:windowsupdate"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-wmimgmt-msc",
  "titleHe": "WMI Control",
  "titleEn": "WMI Control",
  "category": "Win+R",
  "symptom": "בדיקת WMI ותצורתו.",
  "commands": [
   {
    "label": "Win+R",
    "text": "wmimgmt.msc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד wmimgmt.msc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "wmimgmt.msc",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-winver",
  "titleHe": "גרסת Windows",
  "titleEn": "About Windows",
  "category": "Win+R",
  "symptom": "גרסה ובילד, שימושי בבדיקת תאימות עדכונים.",
  "commands": [
   {
    "label": "Win+R",
    "text": "winver"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד winver ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "winver"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-dxdiag",
  "titleHe": "אבחון DirectX",
  "titleEn": "DirectX Diagnostic",
  "category": "Win+R",
  "symptom": "חומרה גרפית ודרייברים.",
  "commands": [
   {
    "label": "Win+R",
    "text": "dxdiag"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד dxdiag ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "dxdiag"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-mmc",
  "titleHe": "Microsoft Management Console",
  "titleEn": "MMC",
  "category": "Win+R",
  "symptom": "בניית קונסולה עם Snap-ins לפי בחירה.",
  "commands": [
   {
    "label": "Win+R",
    "text": "mmc"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד mmc ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "mmc",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-powershell",
  "titleHe": "PowerShell",
  "titleEn": "PowerShell",
  "category": "Win+R",
  "symptom": "חלון PowerShell. Ctrl+Shift+Enter להרצה כמנהל.",
  "commands": [
   {
    "label": "Win+R",
    "text": "powershell"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד powershell ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "powershell"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-cmd",
  "titleHe": "שורת פקודה",
  "titleEn": "Command Prompt",
  "category": "Win+R",
  "symptom": "חלון CMD. Ctrl+Shift+Enter להרצה כמנהל.",
  "commands": [
   {
    "label": "Win+R",
    "text": "cmd"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד cmd ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "cmd"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-shell-startup",
  "titleHe": "תיקיית הפעלה אוטומטית",
  "titleEn": "Startup folder",
  "category": "Win+R",
  "symptom": "תוכניות שנפתחות עם כניסת המשתמש.",
  "commands": [
   {
    "label": "Win+R",
    "text": "shell:startup"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד shell:startup ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "shell:startup"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-temp",
  "titleHe": "קבצים זמניים",
  "titleEn": "Temp folder",
  "category": "Win+R",
  "symptom": "ניקוי זמני, מציאת קבצי התקנה שנכשלו.",
  "commands": [
   {
    "label": "Win+R",
    "text": "%temp%"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד %temp% ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "%temp%"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-appdata",
  "titleHe": "AppData Roaming",
  "titleEn": "AppData (Roaming)",
  "category": "Win+R",
  "symptom": "הגדרות אפליקציות של המשתמש. %localappdata% לגרסה מקומית.",
  "commands": [
   {
    "label": "Win+R",
    "text": "%appdata%"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד %appdata% ולחץ Enter."
  ],
  "ifNotWorking": "",
  "notes": "",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "%appdata%"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-server-c",
  "titleHe": "שיתוף מנהלתי",
  "titleEn": "Administrative share",
  "category": "Win+R",
  "symptom": "גישה לדיסק C של מחשב מרוחק עם הרשאת מנהל.",
  "commands": [
   {
    "label": "Win+R",
    "text": "\\\\SERVER\\c$"
   }
  ],
  "guiSteps": [
   "לחץ Win+R.",
   "הקלד \\\\SERVER\\c$ ולחץ Enter. (Ctrl+Shift+Enter להרצה כמנהל)"
  ],
  "ifNotWorking": "",
  "notes": "דורש הרשאות מנהל (Ctrl+Shift+Enter).",
  "tags": [
   "win+r",
   "run",
   "קיצור",
   "\\\\server\\c$",
   "admin"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "run-tip-admin",
  "titleHe": "טיפ: הרצה כמנהל מחלון Run",
  "titleEn": "Tip: run as admin from Run dialog",
  "category": "Win+R",
  "symptom": "כל פקודה בחלון Run אפשר להריץ עם הרשאות מנהל.",
  "commands": [
   {
    "label": "קיצור",
    "text": "Ctrl+Shift+Enter"
   }
  ],
  "guiSteps": [
   "Win+R ← הקלד את הפקודה.",
   "לחץ Ctrl+Shift+Enter במקום Enter ואשר את UAC."
  ],
  "ifNotWorking": "",
  "notes": "אם לא עובד: חפש את הכלי בתפריט התחל ← קליק ימני ← Run as administrator.",
  "tags": [
   "win+r",
   "admin",
   "טיפ"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 }
];
