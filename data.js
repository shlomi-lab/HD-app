/* Seed data for the helpdesk toolkit. Imported once into IndexedDB. */
window.SEED_VERSION = 5;
window.SEED_ADDED = {"2": ["build-00", "build-01", "build-02", "build-03", "build-04", "build-05", "build-06", "build-07", "build-08", "build-09", "build-10", "build-11", "build-12", "build-13", "build-14", "build-15", "build-16", "build-17", "build-18", "build-19", "build-20", "build-21"], "3": ["ra-rdp-orphan-session"], "4": ["ad-repl-8524", "ad-script-prepare-dc", "ad-script-join-domain", "ad-script-fix-locked", "gpo-share-drive-map", "gpo-ts-lockdown", "ra-rdp-group-access", "ra-duo-mfa-rdp", "vpn-sstp-rras-nps-setup", "vpn-0x80092013", "vpn-terminated-20271", "vpn-nps-invalid-client-13", "vpn-reason-66-eap", "vpn-nps-reason-codes", "vpn-stale-hosts-dns", "vpn-restart-dependent-timedout", "vpn-no-connection-checklist", "veeam-install-job", "veeam-restore-warnings", "cp-install-interfaces", "cp-policy-rules", "cp-read-logs", "cp-dmz-nat-portforward", "servers-behind-firewall"], "5": ["mac-net-info", "mac-net-tests", "mac-dns-flush", "mac-dns-proxy-set", "mac-wifi", "mac-network-reset", "mac-ports-connections", "mac-vpn-cli", "mac-smb-shares", "mac-ad-kerberos", "mac-accounts-passwords", "mac-filevault", "mac-keychain", "mac-sysinfo", "mac-disk-space", "mac-disk-repair", "mac-slow-performance", "mac-app-frozen", "mac-crash-logs", "mac-spotlight", "mac-gatekeeper-quarantine", "mac-privacy-permissions", "mac-updates", "mac-printers", "mac-bluetooth-audio", "mac-boot-recovery", "mac-mdm-profiles", "mac-remote-access", "mac-time-sync", "mac-time-machine", "mac-battery-hardware", "mac-outlook-office", "mac-terminal-toolkit", "mac-shortcuts", "mac-vs-windows-cheatsheet"]};
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
 },
 {
  "id": "build-00",
  "titleHe": "00 · מפת המעבדה וסדר ההקמה",
  "titleEn": "Lab map and build order",
  "category": "Build",
  "symptom": "סקירה של 6 השרתים, כתובות, ותפקידים, והסדר הנכון להקים אותם. דומיין lab.local (NetBIOS: LAB).",
  "commands": [
   {
    "label": "מצב כללי אחרי כל שלב",
    "text": "dcdiag /q; repadmin /replsummary"
   },
   {
    "label": "מי מחזיק תפקידי FSMO",
    "text": "netdom query fsmo"
   }
  ],
  "guiSteps": [
   "01 הכנת שרתים (שם, IP, DNS, פרופיל רשת) ← 02 קידום DC1 ← 03 הצטרפות שרתים לדומיין.",
   "04 OU, משתמשים וקבוצות ← 05 GPO ← 06 RDS על TS1.",
   "07 SQL Server ← 08 הרשאות מינימליות ← 09 PKI (AD CS) ← 10 TLS ← 11 TDE והצפנות.",
   "12 DC2 (לפני Exchange, ותמיד שניהם דולקים) ← 13-15 VPN (IKEv2).",
   "16-19 Exchange Server SE: הכנות, PrepareSchema/AD/Domain, התקנת Mailbox, הגדרות.",
   "הקשחה (Security Baseline) ובדיקת חדירה: דוחות נפרדים, אחרי שהבנייה יציבה."
  ],
  "ifNotWorking": "",
  "notes": "DC1 192.168.75.171 (DC, DNS, CA) · TS1 192.168.75.172 (RDS) · SQL1 192.168.75.173 · DC2 192.168.75.174 (DC שני, GC) · MAIL1 192.168.75.180 (Exchange) · VPN1 Internal 192.168.75.166 / External 192.168.2.60 · Gateway 192.168.75.2. דומיין המייל corp.example.com ושם ה-VPN myvpn.duckdns.org הם placeholders. מקור: דוח מעבדת Windows Server 2025 (שיעור סקירה וארכיטקטורה). ",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "overview",
   "סדר",
   "ארכיטקטורה"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-01",
  "titleHe": "01 · הכנת שרת: שם, IP סטטי, DNS ופרופיל רשת",
  "titleEn": "Prep server: name, static IP, DNS, network profile",
  "category": "Build",
  "symptom": "לפני כל קידום או הצטרפות: שם נכון, כתובת קבועה, DNS שמצביע ל-DC, ופרופיל רשת Private כדי ש-ping יעבוד.",
  "commands": [
   {
    "label": "שינוי שם והפעלה מחדש",
    "text": "Rename-Computer -NewName DC1 -Restart"
   },
   {
    "label": "כתובת סטטית (תבנית)",
    "text": "New-NetIPAddress -InterfaceAlias \"Ethernet0\" -IPAddress 192.168.75.171 -PrefixLength 24 -DefaultGateway 192.168.75.2"
   },
   {
    "label": "DNS (ב-DC1 מצביע לעצמו, בשאר ל-DC1)",
    "text": "Set-DnsClientServerAddress -InterfaceAlias \"Ethernet0\" -ServerAddresses 192.168.75.171"
   },
   {
    "label": "פרופיל רשת Private",
    "text": "Set-NetConnectionProfile -InterfaceAlias \"Ethernet0\" -NetworkCategory Private"
   },
   {
    "label": "אישור ping נכנס",
    "text": "Enable-NetFirewallRule -DisplayName \"*Echo Request*\""
   },
   {
    "label": "בדיקת הפרופיל",
    "text": "Get-NetConnectionProfile"
   },
   {
    "label": "בדיקת קישוריות",
    "text": "ping 192.168.75.172"
   }
  ],
  "guiSteps": [
   "בהתקנה בחר Windows Server 2025 Datacenter (Desktop Experience). בלי הסימון תקבל Server Core (בלי GUI).",
   "שנה שם מחשב, הפעל מחדש.",
   "הגדר IP סטטי ו-DNS (ncpa.cpl ← Properties ← IPv4).",
   "אם ping נכשל: בדוק Get-NetConnectionProfile. אם Public, החלף ל-Private והפעל את כלל Echo Request."
  ],
  "ifNotWorking": "ping עדיין נכשל: בדוק VLAN/רשת הווירטואלית ב-VMware, ושה-IP לא תפוס על ידי מכונה אחרת (arp -a).",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 1-2). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. ב-VMware Easy Install שדה סיסמת Administrator נשאר ריק, ראה רשומה 02.",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "ip",
   "dns",
   "ping",
   "network profile",
   "hostname"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-02",
  "titleHe": "02 · קידום DC1 ויצירת היער lab.local",
  "titleEn": "Promote DC1 and create the forest",
  "category": "Build",
  "symptom": "הקמת הדומיין הראשון: התקנת תפקיד AD DS, יצירת היער, DNS משולב.",
  "commands": [
   {
    "label": "סיסמת Administrator מקומי חזקה (חובה לפני הקידום)",
    "text": "net user Administrator *"
   },
   {
    "label": "התקנת התפקיד",
    "text": "Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools"
   },
   {
    "label": "יצירת היער (יבקש סיסמת DSRM, ואז מפעיל מחדש)",
    "text": "Install-ADDSForest -DomainName \"lab.local\" -DomainNetbiosName \"LAB\" -InstallDns"
   },
   {
    "label": "אימות DC",
    "text": "Get-ADDomainController"
   },
   {
    "label": "בעלי FSMO (צריך 5/5 על DC1)",
    "text": "netdom query fsmo"
   },
   {
    "label": "בדיקות תקינות",
    "text": "dcdiag /q"
   }
  ],
  "guiSteps": [
   "Server Manager ← Add Roles and Features ← Active Directory Domain Services (חלופה ל-PowerShell).",
   "Promote this server to a domain controller ← Add a new forest ← lab.local.",
   "אחרי האתחול: dsa.msc ו-dnsmgmt.msc, ובדוק שיש Zones בשם lab.local ו-_msdcs.lab.local."
  ],
  "ifNotWorking": "אם Install-ADDSForest נכשל על \"password does not meet requirements\": הגדר סיסמה ל-Administrator המקומי עם net user Administrator * והרץ שוב.",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 3). שמור את סיסמת DSRM במקום בטוח (מחוץ לאפליקציה).",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "forest",
   "יער",
   "promote",
   "adds",
   "dc1"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-03",
  "titleHe": "03 · הצטרפות שרתים לדומיין",
  "titleEn": "Join servers to the domain",
  "category": "Build",
  "symptom": "TS1, SQL1, VPN1, MAIL1 ו-DC2 מצטרפים אחרי ש-DC1 פעיל וה-DNS שלהם מצביע אליו.",
  "commands": [
   {
    "label": "DNS ל-DC1",
    "text": "Set-DnsClientServerAddress -InterfaceAlias \"Ethernet0\" -ServerAddresses 192.168.75.171"
   },
   {
    "label": "הצטרפות (TS1, SQL1)",
    "text": "Add-Computer -DomainName \"lab.local\" -Credential LAB\\Administrator -Restart"
   },
   {
    "label": "הצטרפות עם חשבון מנהל אישי (VPN1, MAIL1)",
    "text": "Add-Computer -DomainName \"lab.local\" -Credential LAB\\admin-shlomi -Restart"
   },
   {
    "label": "אימות לאחר אתחול",
    "text": "nltest /sc_verify:lab.local"
   },
   {
    "label": "מי המחשבים בדומיין",
    "text": "Get-ADComputer -Filter * | Select Name,DistinguishedName"
   }
  ],
  "guiSteps": [
   "sysdm.cpl ← Change ← Member of: Domain ← lab.local ← הזן פרטי מנהל דומיין (חלופה ל-PowerShell).",
   "הפעל מחדש. בכניסה בחר LAB\\user.",
   "ב-dsa.msc: המחשבים מופיעים ב-Computers. העבר אותם ל-OU המתאים (רשומה 04)."
  ],
  "ifNotWorking": "אם \"The user name or password is incorrect\": ודא שמקלידים נכון (בדוק עם חשבון אחר), ושה-DNS מצביע ל-DC1.",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 3, 12, 13). ב-VPN1 כרטיס ה-Internal חזר ל-DHCP אחרי ההצטרפות, ראה רשומה 13. אחרי הצטרפות בדוק תמיד את תצורת ה-IP.",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "join",
   "הצטרפות",
   "add-computer",
   "domain join"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-04",
  "titleHe": "04 · OU, משתמשים וקבוצות",
  "titleEn": "OUs, users and groups",
  "category": "Build",
  "symptom": "מבנה ארגוני במקום להשאיר אובייקטים ב-Containers ברירת המחדל: Servers, Corp-Users, ServiceAccounts.",
  "commands": [
   {
    "label": "OU ראשי לשרתים",
    "text": "New-ADOrganizationalUnit -Name \"Servers\" -Path \"DC=lab,DC=local\""
   },
   {
    "label": "OU משנה",
    "text": "New-ADOrganizationalUnit -Name \"TerminalServers\" -Path \"OU=Servers,DC=lab,DC=local\"; New-ADOrganizationalUnit -Name \"DatabaseServers\" -Path \"OU=Servers,DC=lab,DC=local\""
   },
   {
    "label": "OU משתמשים",
    "text": "New-ADOrganizationalUnit -Name \"Corp-Users\" -Path \"DC=lab,DC=local\"; New-ADOrganizationalUnit -Name \"Admins\" -Path \"OU=Corp-Users,DC=lab,DC=local\"; New-ADOrganizationalUnit -Name \"Staff\" -Path \"OU=Corp-Users,DC=lab,DC=local\""
   },
   {
    "label": "OU לחשבונות שירות (נפרד מבני אדם)",
    "text": "New-ADOrganizationalUnit -Name \"ServiceAccounts\" -Path \"DC=lab,DC=local\""
   },
   {
    "label": "הזזת שרתים ל-OU (דוגמה)",
    "text": "Move-ADObject -Identity \"CN=TS1,CN=Computers,DC=lab,DC=local\" -TargetPath \"OU=TerminalServers,OU=Servers,DC=lab,DC=local\""
   },
   {
    "label": "משתמש (תבנית)",
    "text": "New-ADUser -Name \"Danny Staff\" -SamAccountName danny -UserPrincipalName danny@lab.local -Path \"OU=Staff,OU=Corp-Users,DC=lab,DC=local\" -AccountPassword (Read-Host -AsSecureString \"Password\") -Enabled $true"
   },
   {
    "label": "קבוצת אבטחה (תבנית)",
    "text": "New-ADGroup -Name \"IT-Admins\" -GroupScope Global -Path \"OU=Admins,OU=Corp-Users,DC=lab,DC=local\""
   },
   {
    "label": "הוספה לקבוצה",
    "text": "Add-ADGroupMember -Identity \"IT-Admins\" -Members admin-shlomi"
   }
  ],
  "guiSteps": [
   "dsa.msc ← קליק ימני על הדומיין ← New ← Organizational Unit.",
   "גרור מחשבים מ-Computers ל-OU הנכון, או השתמש ב-Move-ADObject.",
   "חשבון מנהל אישי (admin-shlomi) במקום Administrator המובנה, והוספה לקבוצת IT-Admins.",
   "חשבונות שירות ב-OU נפרד, כדי ש-GPO של עובדים לא ישפיעו עליהם בטעות."
  ],
  "ifNotWorking": "",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 4, 7). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. OU הוא מיקום ולא קבוצת אבטחה. אי אפשר לתת הרשאה ל-OU, רק לקבוצה.",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "ou",
   "organizational unit",
   "users",
   "groups",
   "service account"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-05",
  "titleHe": "05 · GPO: יצירה, קישור והוכחת אכיפה",
  "titleEn": "GPO: create, link, prove enforcement",
  "category": "Build",
  "symptom": "יצירת מדיניות שחוסמת Control Panel לעובדים, קישור ל-OU Staff, והוכחה שהיא חלה בפועל.",
  "commands": [
   {
    "label": "יצירת GPO (תבנית)",
    "text": "New-GPO -Name \"Staff-Restrictions\""
   },
   {
    "label": "קישור ל-OU (תבנית)",
    "text": "New-GPLink -Name \"Staff-Restrictions\" -Target \"OU=Staff,OU=Corp-Users,DC=lab,DC=local\""
   },
   {
    "label": "החלה מיידית",
    "text": "gpupdate /force"
   },
   {
    "label": "מה חל על המשתמש",
    "text": "gpresult /r /scope user"
   }
  ],
  "guiSteps": [
   "gpmc.msc ← Group Policy Objects ← קליק ימני ← New ← Staff-Restrictions.",
   "Edit ← User Configuration ← Policies ← Administrative Templates ← Control Panel ← Prohibit access to Control Panel and PC settings ← Enabled.",
   "קליק ימני על OU Staff ← Link an Existing GPO ← בחר את ה-GPO.",
   "הוכחה: התחבר כ-danny ל-TS1 ופתח Control Panel. צפויה חסימה (\"This operation has been cancelled due to restrictions\")."
  ],
  "ifNotWorking": "אם לא חל: gpresult /h C:\\gp.html ובדוק קישור ל-OU הנכון, Security Filtering והאם המשתמש בתוך ה-OU.",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 5). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. ",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "gpo",
   "group policy",
   "link",
   "enforcement"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-06",
  "titleHe": "06 · RDS על TS1: Session Collection והרשאות",
  "titleEn": "RDS on TS1: collection and access control",
  "category": "Build",
  "symptom": "פריסת Remote Desktop Services, יצירת Collection והגבלת הכניסה לקבוצות בלבד (עם מבחן שלילי וחיובי).",
  "commands": [
   {
    "label": "מצב מנהל דומיין: פריסה (בדוח נעשה באשף GUI)",
    "text": "New-RDSessionDeployment -ConnectionBroker TS1.lab.local -WebAccessServer TS1.lab.local -SessionHost TS1.lab.local"
   },
   {
    "label": "Collection (תבנית)",
    "text": "New-RDSessionCollection -CollectionName \"Staff-Desktop\" -SessionHost TS1.lab.local -ConnectionBroker TS1.lab.local"
   },
   {
    "label": "קבוצת אבטחה למשתמשי RDP (תבנית)",
    "text": "New-ADGroup -Name \"Staff-Users\" -GroupScope Global -Path \"OU=Staff,OU=Corp-Users,DC=lab,DC=local\""
   },
   {
    "label": "הגבלת ה-Collection לקבוצות",
    "text": "Set-RDSessionCollectionConfiguration -CollectionName \"Staff-Desktop\" -UserGroup \"LAB\\Staff-Users\",\"LAB\\IT-Admins\" -ConnectionBroker \"TS1.lab.local\""
   },
   {
    "label": "Loopback (דרש הפעלה מחדש)",
    "text": "reg add \"HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\" /v DisableLoopbackCheck /t REG_DWORD /d 1 /f"
   },
   {
    "label": "Loopback: שמות מותרים",
    "text": "reg add \"HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\MSV1_0\" /v BackConnectionHostNames /t REG_MULTI_SZ /d TS1.lab.local /f"
   }
  ],
  "guiSteps": [
   "Server Manager ← Add Roles and Features ← Remote Desktop Services installation ← Standard deployment ← Connection Broker + Web Access + Session Host.",
   "חובה להתחבר כמשתמש דומיין (LAB\\Administrator), לא כמנהל מקומי: \"You must be logged on as a domain user\".",
   "Collections ← Create Session Collection ← בחר קבוצת אבטחה (לא OU).",
   "מבחן שלילי: משתמש שאינו בקבוצה נחסם (\"החיבור נדחה\"). מבחן חיובי אחרי הוספת הקבוצה ל-Collection.",
   "חיבור בדיקה מבחוץ: mstsc /v:192.168.75.172."
  ],
  "ifNotWorking": "שגיאת \"Name Not Found\" בהוספת קבוצה: ודא שבחרת Security Group ולא OU. חיבור נחסם למנהל: הוסף את IT-Admins ל-UserGroup (הפקודה בשורה 4).",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 6). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. DisableLoopbackCheck מחליש הגנה מפני NTLM reflection. BackConnectionHostNames לבדו הוא הצר והבטוח יותר, והדוח הפעיל את שניהם.",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "rds",
   "terminal server",
   "ts1",
   "session collection",
   "loopback"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-07",
  "titleHe": "07 · SQL Server 2022 על SQL1 וחשבון שירות",
  "titleEn": "SQL Server 2022 on SQL1 + service account",
  "category": "Build",
  "symptom": "התקנת SQL Server Developer במצב Windows Authentication, פתיחת פורט 1433 ויצירת חשבון שירות ייעודי.",
  "commands": [
   {
    "label": "בדיקת גרסה",
    "text": "sqlcmd -S localhost -E -Q \"SELECT @@VERSION\""
   },
   {
    "label": "שחרור מצב Single User שנתקע אחרי כשל Setup",
    "text": "Restart-Service MSSQLSERVER -Force"
   },
   {
    "label": "כלל חומת אש (תבנית, מוגבל לרשת המעבדה)",
    "text": "New-NetFirewallRule -DisplayName \"SQL Server 1433\" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow -RemoteAddress 192.168.75.0/24"
   },
   {
    "label": "חשבון שירות (תבנית)",
    "text": "New-ADUser -Name \"svc-bankapp\" -SamAccountName svc-bankapp -Path \"OU=ServiceAccounts,DC=lab,DC=local\" -AccountPassword (Read-Host -AsSecureString \"Password\") -Enabled $true -PasswordNeverExpires $true -CannotChangePassword $true"
   }
  ],
  "guiSteps": [
   "ב-Setup בחר Windows authentication mode והוסף LAB\\Administrator ו-LAB\\IT-Admins כ-SQL Administrators.",
   "אם Setup נכשל עם שגיאה 9001 (msdb): בדוק אם השירות Running אבל \"Server is in single user mode\". הרץ Restart-Service MSSQLSERVER -Force.",
   "התקן SSMS והתחבר עם Windows Authentication (ב-SSMS 22 Encrypt=Mandatory כברירת מחדל, ולכן סומן Trust Server Certificate).",
   "חשבון שירות שייך ל-OU=ServiceAccounts, לא ל-OU של עובדים."
  ],
  "ifNotWorking": "",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 7). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. בדוח כלל חומת האש ל-1433 נפתח ל-Any, ומתוכנן להגבלה ל-IPs ספציפיים; בתבנית כאן כבר מוגבל.",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "sql",
   "sql server",
   "sql1",
   "service account",
   "svc"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-08",
  "titleHe": "08 · הרשאות מינימליות ל-Database (BankDemo)",
  "titleEn": "Least-privilege database access",
  "category": "Build",
  "symptom": "Login מבוסס חשבון AD, ללא SQL Login נפרד, עם datareader ו-datawriter בלבד (בלי db_owner).",
  "commands": [
   {
    "label": "יצירת ה-DB",
    "text": "CREATE DATABASE BankDemo;"
   },
   {
    "label": "Login מ-Windows",
    "text": "CREATE LOGIN [LAB\\svc-bankapp] FROM WINDOWS;"
   },
   {
    "label": "מיפוי והרשאות מינימליות",
    "text": "USE BankDemo;\nCREATE USER [LAB\\svc-bankapp] FOR LOGIN [LAB\\svc-bankapp];\nALTER ROLE db_datareader ADD MEMBER [LAB\\svc-bankapp];\nALTER ROLE db_datawriter ADD MEMBER [LAB\\svc-bankapp];"
   },
   {
    "label": "אימות הרשאות",
    "text": "SELECT dp.name, r.name AS role\nFROM sys.database_role_members m\nJOIN sys.database_principals r ON r.principal_id = m.role_principal_id\nJOIN sys.database_principals dp ON dp.principal_id = m.member_principal_id\nWHERE dp.name = N'LAB\\svc-bankapp';"
   }
  ],
  "guiSteps": [
   "SSMS ← Security ← Logins ← New Login ← Windows authentication ← LAB\\svc-bankapp.",
   "BankDemo ← User Mapping ← סמן db_datareader ו-db_datawriter בלבד.",
   "ודא ב-Security ← Users של ה-DB שהמשתמש מופיע."
  ],
  "ifNotWorking": "",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 8). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. הפרדת תפקידים: האפליקציה נוגעת בנתונים, האדמין בתחזוקה בלבד.",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "sql",
   "least privilege",
   "login",
   "bankdemo",
   "permissions"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-09",
  "titleHe": "09 · PKI: AD CS ותבנית תעודה (SQLServerTLS)",
  "titleEn": "PKI: AD CS and certificate template",
  "category": "Build",
  "symptom": "Enterprise CA על DC1, תבנית תעודה מותאמת לשרת, והנפקת תעודה ל-SQL1.",
  "commands": [
   {
    "label": "התקנת תפקיד CA (תבנית)",
    "text": "Install-WindowsFeature ADCS-Cert-Authority -IncludeManagementTools"
   },
   {
    "label": "הגדרת Enterprise Root CA (תבנית)",
    "text": "Install-AdcsCertificationAuthority -CAType EnterpriseRootCa -CACommonName \"lab-DC1-CA\" -KeyLength 4096 -HashAlgorithmName SHA256 -ValidityPeriod Years -ValidityPeriodUnits 10 -Force"
   },
   {
    "label": "רענון מדיניות ב-SQL1 לפני בקשת תעודה",
    "text": "gpupdate /force"
   },
   {
    "label": "תעודות בחנות המחשב",
    "text": "certutil -store my"
   }
  ],
  "guiSteps": [
   "Server Manager ← AD CS ← Enterprise CA (Root).",
   "certtmpl.msc ← שכפל תבנית Web Server לשם SQLServerTLS ← Application Policies: Server Authentication.",
   "לשונית Security: Domain Computers ← Enroll + Autoenroll.",
   "certsrv.msc ← Certificate Templates ← New ← Certificate Template to Issue ← SQLServerTLS.",
   "ב-SQL1: certlm.msc ← Personal ← Certificates ← All Tasks ← Request New Certificate ← SQLServerTLS."
  ],
  "ifNotWorking": "\"Certificate types are not available\": הרץ gpupdate /force ב-SQL1, המתן דקה ונסה שוב. ההרשאות על התבנית עוד לא רועננו.",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 8). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. ",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "pki",
   "ad cs",
   "ca",
   "certificate",
   "template"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-10",
  "titleHe": "10 · TLS ב-SQL Server (Force Encryption)",
  "titleEn": "SQL Server TLS (Force Encryption)",
  "category": "Build",
  "symptom": "קישור התעודה לשירות SQL והפעלת הצפנה כפויה על כל החיבורים.",
  "commands": [
   {
    "label": "Restart אחרי שינוי הגדרות TLS",
    "text": "Restart-Service MSSQLSERVER -Force"
   },
   {
    "label": "אימות שהחיבור מוצפן",
    "text": "SELECT session_id, encrypt_option FROM sys.dm_exec_connections WHERE session_id = @@SPID;"
   }
  ],
  "guiSteps": [
   "certlm.msc ← Personal ← Certificates ← התעודה ← All Tasks ← Manage Private Keys ← Add.",
   "ב-Locations בחר את המחשב המקומי. הקלד NT SERVICE\\MSSQLSERVER ← Check Names (אם \"Name Not Found\", תקן את הפורמט והמיקום) ← Full Control.",
   "SQL Server Configuration Manager ← Protocols for MSSQLSERVER ← Properties ← Certificate: בחר את התעודה.",
   "לשונית Flags: Force Encryption = Yes ← Restart לשירות (אם נכשל פעם ראשונה, הרץ שוב).",
   "בלקוח: Encrypt=Mandatory. עד שה-CA הפנימי מופץ, סמן Trust Server Certificate."
  ],
  "ifNotWorking": "אם השירות לא עולה: בדוק הרשאת המפתח הפרטי לחשבון השירות, וכי התעודה היא Server Authentication והשם תואם.",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 9). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. ",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "tls",
   "encryption",
   "force encryption",
   "sql",
   "certificate"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-11",
  "titleHe": "11 · TDE, Always Encrypted ו-Auditing",
  "titleEn": "TDE, Always Encrypted and auditing",
  "category": "Build",
  "symptom": "הצפנה במנוחה (TDE) עם גיבוי תעודה, הצפנת עמודות, ו-Audit על ה-DB.",
  "commands": [
   {
    "label": "Master Key ותעודה (תבנית)",
    "text": "USE master;\nCREATE MASTER KEY ENCRYPTION BY PASSWORD = '<strong-password>';\nCREATE CERTIFICATE BankDemoTDECert WITH SUBJECT = 'BankDemo TDE';"
   },
   {
    "label": "מפתח הצפנה והפעלה (תבנית)",
    "text": "USE BankDemo;\nCREATE DATABASE ENCRYPTION KEY WITH ALGORITHM = AES_256 ENCRYPTION BY SERVER CERTIFICATE BankDemoTDECert;\nALTER DATABASE BankDemo SET ENCRYPTION ON;"
   },
   {
    "label": "גיבוי התעודה והמפתח הפרטי (קריטי! בלי זה אין שחזור)",
    "text": "BACKUP CERTIFICATE BankDemoTDECert TO FILE = 'C:\\TDE_Backup\\BankDemoTDECert.cer'\nWITH PRIVATE KEY (FILE = 'C:\\TDE_Backup\\BankDemoTDECert.pvk', ENCRYPTION BY PASSWORD = '<strong-password>');"
   },
   {
    "label": "הגבלת התיקייה למנהלים בלבד (תבנית)",
    "text": "icacls C:\\TDE_Backup /inheritance:r /grant \"Administrators:(OI)(CI)F\" \"SYSTEM:(OI)(CI)F\""
   },
   {
    "label": "אימות (encryption_state = 3 = מוצפן)",
    "text": "SELECT DB_NAME(database_id), encryption_state FROM sys.dm_database_encryption_keys;"
   },
   {
    "label": "הוכחה: חיבור כחשבון השירות",
    "text": "runas /user:LAB\\svc-bankapp cmd"
   },
   {
    "label": "בחלון החדש: מי אני, ומה רואים בעמודות מוצפנות",
    "text": "sqlcmd -S SQL1 -d BankDemo -E -Q \"SELECT SUSER_SNAME(); SELECT * FROM Customers\""
   },
   {
    "label": "Audit (תבנית T-SQL, בדוח נעשה ב-GUI)",
    "text": "USE master;\nCREATE SERVER AUDIT BankDemoAudit TO FILE (FILEPATH = 'C:\\SQLAudit\\');\nALTER SERVER AUDIT BankDemoAudit WITH (STATE = ON);\nUSE BankDemo;\nCREATE DATABASE AUDIT SPECIFICATION BankDemoDbAudit FOR SERVER AUDIT BankDemoAudit\nADD (SELECT, INSERT, UPDATE, DELETE ON DATABASE::BankDemo BY public) WITH (STATE = ON);"
   }
  ],
  "guiSteps": [
   "Always Encrypted: SSMS ← Tables ← Customers ← קליק ימני ← Encrypt Columns ← FullName ו-Balance.",
   "בדוח, ההוכחה היא שחיבור רגיל (בלי Column Encryption Setting) רואה ערכים לא קריאים בעמודות המוצפנות.",
   "Audit ב-GUI: BankDemo ← Security ← Database Audit Specifications ← New.",
   "בדוק ב-Audit Log (SSMS ← Security ← Audits ← View Audit Logs) שהפעולות נרשמות."
  ],
  "ifNotWorking": "",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 10). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. סיסמאות בפקודות הן placeholders. שמור אותן במנהל סיסמאות. בלי גיבוי התעודה אי אפשר לשחזר DB מוצפן.",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "tde",
   "always encrypted",
   "audit",
   "sql",
   "backup certificate"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-12",
  "titleHe": "12 · Domain Controller שני (DC2) ורפליקציה",
  "titleEn": "Second DC (DC2) and replication",
  "category": "Build",
  "symptom": "DC נוסף לעמידות ולרפליקציית AD, ואימות שהכול מסונכרן.",
  "commands": [
   {
    "label": "התקנה (תבנית)",
    "text": "Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools"
   },
   {
    "label": "קידום (תבנית עם Credential)",
    "text": "Install-ADDSDomainController -DomainName lab.local -InstallDns -Credential (Get-Credential LAB\\admin-shlomi)"
   },
   {
    "label": "אימות",
    "text": "Get-ADDomainController -Filter * | Select Name,IPv4Address,IsGlobalCatalog"
   },
   {
    "label": "סיכום רפליקציה (0 כשלים)",
    "text": "repadmin /replsummary"
   },
   {
    "label": "סנכרון מלא",
    "text": "repadmin /syncall /AdeP"
   },
   {
    "label": "בדיקת DNS",
    "text": "dcdiag /test:dns"
   },
   {
    "label": "אם dcdiag נכשל: בדוק פרופיל רשת",
    "text": "Get-NetConnectionProfile"
   },
   {
    "label": "תיקון: Private, Netlogon ורישום DNS",
    "text": "Set-NetConnectionProfile -NetworkCategory Private; Restart-Service Netlogon -Force; ipconfig /registerdns"
   }
  ],
  "guiSteps": [
   "לפני הקידום: DNS של DC2 מצביע ל-DC1, והשרת חבר בדומיין.",
   "Promote to domain controller ← Add a domain controller to an existing domain ← lab.local.",
   "אחרי האתחול: dssite.msc ← Servers ← DC2 ← NTDS Settings ← חיבורי רפליקציה.",
   "dcdiag נכשל עם רשומות SRV חסרות ו-Event 1988: סיבה אפשרית היא פרופיל רשת Public ב-DC עצמו."
  ],
  "ifNotWorking": "אם עדיין לא מסתנכרן: dcdiag /v, ואז בדוק DNS של שני ה-DC ופורטים 135, 389, 445, 53 ביניהם.",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 11). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. שני ה-DC חייבים להיות דולקים לפני כל עבודה על AD או Exchange. כיבוי אחד גרם ליותר מתקלה אחת במעבדה.",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "dc2",
   "replication",
   "repadmin",
   "additional domain controller"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-13",
  "titleHe": "13 · VPN1: רשת dual-homed ו-RRAS (IKEv2)",
  "titleEn": "VPN1: dual-homed network and RRAS (IKEv2)",
  "category": "Build",
  "symptom": "שער VPN עם שני כרטיסי רשת: External (אינטרנט) ו-Internal (רשת המעבדה), RRAS מוגבל ל-IKEv2.",
  "commands": [
   {
    "label": "שמות ממשקים",
    "text": "Rename-NetAdapter -Name \"Ethernet0\" -NewName \"External\"; Rename-NetAdapter -Name \"Ethernet1\" -NewName \"Internal\""
   },
   {
    "label": "DNS פנימי ל-DC1",
    "text": "Set-DnsClientServerAddress -InterfaceAlias \"Internal\" -ServerAddresses \"192.168.75.171\""
   },
   {
    "label": "הסרת Default Gateway מהממשק הפנימי",
    "text": "Get-NetRoute -InterfaceAlias \"Internal\" -DestinationPrefix \"0.0.0.0/0\" | Remove-NetRoute -Confirm:$false"
   },
   {
    "label": "אחרי הצטרפות לדומיין: להחזיר כתובת סטטית פנימית (תבנית)",
    "text": "Set-NetIPInterface -InterfaceAlias \"Internal\" -Dhcp Disabled; New-NetIPAddress -InterfaceAlias \"Internal\" -IPAddress 192.168.75.166 -PrefixLength 24"
   },
   {
    "label": "התקנת תפקידי RRAS",
    "text": "Install-WindowsFeature -Name DirectAccess-VPN, Routing -IncludeManagementTools"
   }
  ],
  "guiSteps": [
   "חייב להיות default route אחד בלבד (דרך External). לפנים אין Gateway.",
   "אחרי Domain Join בדוק את הממשק הפנימי: הוא חזר ל-DHCP במעבדה.",
   "rrasmgmt.msc ← Configure and Enable ← Deploy VPN only (לא DirectAccess) ← Custom configuration ← VPN access.",
   "Properties ← Security: \"Allow custom IPsec policy\" לא מסומן (אימות לפי תעודה). Authentication Methods: EAP ו-MS-CHAP v2.",
   "IPv4 ← Static address pool: 192.168.75.200 עד 192.168.75.220. בדוק ש-Number הוא 21 (277 משמעותו טעות באוקטט האחרון).",
   "שם ה-VPN בדוח (placeholder): myvpn.duckdns.org."
  ],
  "ifNotWorking": "אם ניסיון לקבוע כתובת סטטית נכשל כי היא תפוסה ב-DHCP: כבה DHCP על הממשק, ואז הגדר מחדש.",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 12). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. IKEv2 נבחר על פני SSTP ו-L2TP: תמיכה מובנית ב-Windows ו-iOS, בלי Pre-Shared Key גלוי.",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "vpn",
   "rras",
   "ikev2",
   "dual-homed",
   "vpn1"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-14",
  "titleHe": "14 · VPN1: תעודת שרת ל-IKEv2 (certreq)",
  "titleEn": "VPN1: server certificate for IKEv2",
  "category": "Build",
  "symptom": "תעודה שה-SAN שלה תואם בדיוק לשם שהלקוח מקליד (myvpn.duckdns.org), מונפקת מה-CA הפנימי.",
  "commands": [
   {
    "label": "יצירת בקשה",
    "text": "certreq -new C:\\vpn-cert-request.inf C:\\vpn-cert-request.req"
   },
   {
    "label": "שליחה ל-CA (כמשתמש דומיין!)",
    "text": "certreq -submit -config \"DC1.lab.local\\lab-DC1-CA\" C:\\vpn-cert-request.req C:\\vpn-cert-request.cer"
   },
   {
    "label": "התקנת התעודה",
    "text": "certreq -accept C:\\vpn-cert-request.cer"
   },
   {
    "label": "בדיקת מי המשתמש",
    "text": "whoami"
   },
   {
    "label": "אימות התעודה",
    "text": "certutil -store my"
   },
   {
    "label": "דוגמה לקובץ INF (תבנית, לא הועתק מהדוח)",
    "text": "[Version]\nSignature=\"$Windows NT$\"\n[NewRequest]\nSubject = \"CN=myvpn.duckdns.org\"\nKeyLength = 2048\nKeySpec = 1\nKeyUsage = 0xA0\nMachineKeySet = True\nExportable = False\nRequestType = PKCS10\n[EnhancedKeyUsageExtension]\nOID = 1.3.6.1.5.5.7.3.1\n[Extensions]\n2.5.29.17 = \"{text}\"\n_continue_ = \"dns=myvpn.duckdns.org\"\n[RequestAttributes]\nCertificateTemplate = VPN-Server-Auth"
   }
  ],
  "guiSteps": [
   "certtmpl.msc ← שכפל Web Server לתבנית VPN-Server-Auth ← Subject Name: Supply in the request ← Security: VPN1$ עם Read + Enroll (תוקף שנתיים, חידוש 6 שבועות).",
   "certsrv.msc ← Certificate Templates ← New ← Certificate Template to Issue ← VPN-Server-Auth.",
   "ב-VPN1: certreq -new, certreq -submit, certreq -accept.",
   "אימות: certlm.msc ← Personal ← התעודה עם Subject ו-DNS Name myvpn.duckdns.org.",
   "IKEv2 ב-RRAS בוחר אוטומטית תעודה עם Server Authentication מ-Local Machine\\Personal, אין קישור ידני."
  ],
  "ifNotWorking": "\"RPC server is unavailable\" ב-certreq -submit: הסיבה במעבדה הייתה התחברות כמשתמש מקומי (VPN\\Administrator). התחבר כ-LAB\\Administrator ונסה שוב. חומת אש ו-RPC היו תקינים.",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 12). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. ה-INF בדוח הוגדר לפי SAN ותבנית VPN-Server-Auth, אך הקובץ עצמו מופיע בצילום מסך בלבד.",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "certreq",
   "ikev2",
   "certificate",
   "san",
   "vpn"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-15",
  "titleHe": "15 · VPN: גישה מבחוץ (לא בוצע במעבדה)",
  "titleEn": "VPN: external access (not done in lab)",
  "category": "Build",
  "symptom": "מה נדרש כדי שלקוח באינטרנט יתחבר ל-IKEv2: הפניית פורטים, DDNS, אמון ב-CA, ופרופיל לקוח.",
  "commands": [
   {
    "label": "בדיקת כללי חומת אש של RRAS ב-VPN1",
    "text": "Get-NetFirewallRule -DisplayGroup \"Routing and Remote Access\" | Select DisplayName, Enabled"
   },
   {
    "label": "ייצוא תעודת ה-Root CA (לא תעודת ה-VPN)",
    "text": "certutil -ca.cert C:\\lab-root-ca.cer"
   },
   {
    "label": "הפניות בנתב",
    "text": "UDP 500   -> 192.168.2.60   (IKE)\nUDP 4500  -> 192.168.2.60   (IPsec NAT-T)"
   }
  ],
  "guiSteps": [
   "הקצה IP פנימי קבוע ל-VPN1 בנתב (DHCP Reservation לפי MAC של External).",
   "בנתב: Port Forwarding ל-UDP 500 ו-UDP 4500 אל VPN1. לא נדרשים פורטים נוספים ל-IKEv2 בלבד.",
   "ודא ששם ה-DDNS מצביע על ה-IP הציבורי הנוכחי.",
   "בלקוח חיצוני: התקן את תעודת ה-Root CA ב-Local Machine ← Trusted Root Certification Authorities.",
   "Windows: Settings ← Network & Internet ← VPN ← Add: Windows (built-in), IKEv2, myvpn.duckdns.org, ופרטי משתמש דומייני.",
   "בדוק דרך Hotspot סלולרי ולא דרך ה-Wi-Fi הביתי."
  ],
  "ifNotWorking": "חלופה נקייה: תעודה מ-CA ציבורי (Let's Encrypt) עבור שם ה-VPN, ואז אין צורך להפיץ Root CA.",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור נספח). לא בוצע במעבדה במכוון (כדי לא לשנות ניתוב ברשת הביתית); מתועד בדוח כהוראות ליישום עתידי.",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "vpn",
   "port forwarding",
   "ddns",
   "duckdns",
   "ikev2"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-16",
  "titleHe": "16 · Exchange SE: הכנות לפני Setup (Pre-Flight)",
  "titleEn": "Exchange SE pre-flight checklist",
  "category": "Build",
  "symptom": "רוב הזמן בהתקנת Exchange במעבדה (יומיים) נבע מהכנות חסרות. עם הרשימה הזו זה שעתיים-שלוש.",
  "commands": [
   {
    "label": "דיסק נתונים נפרד (תבנית)",
    "text": "Initialize-Disk -Number 1 -PartitionStyle GPT; New-Partition -DiskNumber 1 -UseMaximumSize -DriveLetter E | Format-Volume -FileSystem NTFS -NewFileSystemLabel ExchangeDB"
   },
   {
    "label": "תלויות Windows (שים לב: Web-Lgcy-Mgmt-Console לא קיים ב-WS2025)",
    "text": "Install-WindowsFeature Server-Media-Foundation, NET-Framework-45-Features, RPC-over-HTTP-proxy,\nRSAT-Clustering, RSAT-Clustering-CmdInterface, RSAT-Clustering-Mgmt, RSAT-Clustering-PowerShell,\nWAS-Process-Model, Web-Asp-Net45, Web-Basic-Auth, Web-Client-Auth, Web-Digest-Auth, Web-Dir-Browsing,\nWeb-Dyn-Compression, Web-Http-Errors, Web-Http-Logging, Web-Http-Redirect, Web-Http-Tracing,\nWeb-ISAPI-Ext, Web-ISAPI-Filter, Web-Mgmt-Compat, Web-Metabase, Web-Lgcy-Scripting, Web-Mgmt-Console,\nWeb-Mgmt-Service, Web-Net-Ext45, Web-Request-Monitor, Web-Server, Web-Stat-Compression,\nWeb-Static-Content, Web-Windows-Auth, Web-WMI, Windows-Identity-Foundation, RSAT-ADDS"
   },
   {
    "label": "בדיקת .NET (נדרש 528040 ומעלה)",
    "text": "(Get-ItemProperty \"HKLM:\\SOFTWARE\\Microsoft\\NET Framework Setup\\NDP\\v4\\Full\").Release"
   },
   {
    "label": "כיבוי Hypervisor/VBS ב-VM בלי Nested Virtualization",
    "text": "bcdedit /set hypervisorlaunchtype off"
   },
   {
    "label": "VBS ברישום (1)",
    "text": "reg add \"HKLM\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\" /v EnableVirtualizationBasedSecurity /t REG_DWORD /d 0 /f"
   },
   {
    "label": "VBS ברישום (2)",
    "text": "reg add \"HKLM\\SOFTWARE\\Microsoft\\DeviceGuard\" /v EnableVirtualizationBasedSecurity /t REG_DWORD /d 0 /f"
   },
   {
    "label": "VBS ברישום (3)",
    "text": "reg add \"HKLM\\SOFTWARE\\Microsoft\\DeviceGuard\" /v RequirePlatformSecurityFeatures /t REG_DWORD /d 0 /f"
   },
   {
    "label": "מנהל מקומי בפועל על שרת Exchange",
    "text": "Add-LocalGroupMember -Group \"Administrators\" -Member \"LAB\\admin-shlomi\""
   },
   {
    "label": "חריגי Defender (מונע תקיעה על 16%)",
    "text": "Add-MpPreference -ExclusionPath \"C:\\Program Files\\Microsoft\\Exchange Server\"\nAdd-MpPreference -ExclusionPath \"F:\\\"\nAdd-MpPreference -ExclusionPath \"C:\\ExchangeSetupLogs\"\nAdd-MpPreference -ExclusionProcess \"msiexec.exe\"\nAdd-MpPreference -ExclusionProcess \"Setup.exe\"\nAdd-MpPreference -ExclusionProcess \"ServiceControl.exe\""
   },
   {
    "label": "חברות זמנית לצורך Prepare (תבנית)",
    "text": "Add-ADGroupMember -Identity \"Schema Admins\" -Members admin-shlomi; Add-ADGroupMember -Identity \"Enterprise Admins\" -Members admin-shlomi"
   },
   {
    "label": "הסרה מיד אחר כך (תבנית)",
    "text": "Remove-ADGroupMember -Identity \"Schema Admins\" -Members admin-shlomi -Confirm:$false; Remove-ADGroupMember -Identity \"Enterprise Admins\" -Members admin-shlomi -Confirm:$false"
   },
   {
    "label": "לפני הכל: DC-ים תקינים",
    "text": "dcdiag /q; repadmin /replsummary"
   }
  ],
  "guiSteps": [
   "שני ה-DC דולקים ומשוכפלים (dcdiag, repadmin) לפני PrepareSchema.",
   "התקן ידנית: Visual C++ Redistributable 2013 x64, UCMA 4.0 Core Runtime, ו-IIS URL Rewrite Module 2.1 (x64).",
   "הורד ISO רשמי של Exchange Server SE מ-Microsoft ושמור בדיסק מקומי.",
   "הרץ Setup רק ממסוף PowerShell קלאסי (Win+R ← powershell, עם Run as administrator), לא מ-Windows Terminal.",
   "חברות ב-Schema Admins ו-Enterprise Admins היא זמנית בלבד. הסר מיד אחרי ה-Prepare.",
   "אחרי כל הפעלה מחדש: מפה את ה-ISO מחדש (Mount-DiskImage אינו נשמר)."
  ],
  "ifNotWorking": "",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 13 (Pre-Flight Checklist)). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. Exchange 2016/2019 יצאו משירות ב-14.10.2025. הגרסה היחידה להתקנה חדשה היא Subscription Edition (SE).",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "exchange",
   "prerequisites",
   "checklist",
   "defender",
   "vbs",
   "url rewrite"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-17",
  "titleHe": "17 · Exchange SE: PrepareSchema, PrepareAD, PrepareDomain",
  "titleEn": "Exchange SE: PrepareSchema / AD / Domain",
  "category": "Build",
  "symptom": "הרחבת סכמת AD והכנת הארגון והדומיין, מ-PowerShell מורם ומקונסולה קלאסית.",
  "commands": [
   {
    "label": "מיפוי ה-ISO (בכל הפעלה מחדש!)",
    "text": "Mount-DiskImage -ImagePath \"C:\\Users\\admin-shlomi\\Downloads\\ExchangeServerSE-x64.iso\""
   },
   {
    "label": "האם החלון מורם? (חייב True)",
    "text": "([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)"
   },
   {
    "label": "הרחבת סכמה (תבנית)",
    "text": ".\\Setup.exe /PrepareSchema /IAcceptExchangeServerLicenseTerms_DiagnosticDataOFF"
   },
   {
    "label": "אימות הסכמה (בדוח: 17003)",
    "text": "Get-ADObject \"CN=ms-Exch-Schema-Version-Pt,CN=Schema,CN=Configuration,DC=lab,DC=local\" -Property rangeUpper"
   },
   {
    "label": "הכנת הארגון",
    "text": ".\\Setup.exe /PrepareAD /OrganizationName:\"shlomi-lab\" /IAcceptExchangeServerLicenseTerms_DiagnosticDataOFF"
   },
   {
    "label": "הכנת הדומיין (תבנית)",
    "text": ".\\Setup.exe /PrepareDomain /IAcceptExchangeServerLicenseTerms_DiagnosticDataOFF"
   },
   {
    "label": "אם ldifde 8224: רישום רשומות DNS מחדש ב-DC2",
    "text": "nltest /dsregdns"
   },
   {
    "label": "כפיית רפליקציה של הסכמה",
    "text": "repadmin /replicate DC1.lab.local DC2.lab.local \"CN=Schema,CN=Configuration,DC=lab,DC=local\""
   },
   {
    "label": "בדיקת רפליקציות",
    "text": "dcdiag /test:replications"
   }
  ],
  "guiSteps": [
   "לפני הכל: שני ה-DC דולקים. כיבוי DC2 גרם לשגיאת ldifde 8224.",
   "פתח PowerShell קלאסי (לא Windows Terminal) כמנהל. אחרת Setup קורס מיד עם ArgumentOutOfRangeException.",
   "ב-Subscription Edition חובה לציין /IAcceptExchangeServerLicenseTerms_DiagnosticDataON או _DiagnosticDataOFF. הדגל הישן לבדו נדחה.",
   "הרץ מהתיקייה של ה-ISO (cd F:\\), ולא מתיקיית הבית.",
   "אחרי PrepareAD ו-PrepareDomain: הסר את admin-shlomi מ-Schema Admins ו-Enterprise Admins."
  ],
  "ifNotWorking": "ldifde 8224: במעבדה DC2 היה כבוי ואז DNS חסר. הדלק את DC2, הרץ nltest /dsregdns, ואז repadmin /replicate (הפקודות למעלה), ובדוק dcdiag /test:replications.",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 13). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. ",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "exchange",
   "prepareschema",
   "preparead",
   "preparedomain",
   "ldifde",
   "schema"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-18",
  "titleHe": "18 · Exchange SE: התקנת תפקיד Mailbox",
  "titleEn": "Exchange SE: install Mailbox role",
  "category": "Build",
  "symptom": "ההתקנה עצמה, ומה לעשות כשהיא נתקעת.",
  "commands": [
   {
    "label": "התקנה",
    "text": ".\\Setup.exe /mode:Install /role:Mailbox /IAcceptExchangeServerLicenseTerms_DiagnosticDataOFF"
   },
   {
    "label": "לוג ההתקנה (חמש שורות אחרונות)",
    "text": "Get-Content C:\\ExchangeSetupLogs\\ExchangeSetup.log -Tail 5"
   },
   {
    "label": "האם Defender סורק בזמן אמת?",
    "text": "Get-MpComputerStatus | Select RealTimeProtectionEnabled"
   },
   {
    "label": "אחרי ההתקנה: שירותי Exchange",
    "text": "Get-Service MSExchange* | Select Name,Status"
   }
  ],
  "guiSteps": [
   "לפני ההתקנה: חריגי Defender, URL Rewrite 2.1, VBS כבוי, ISO ממופה (רשומה 16).",
   "Setup נעצר על \"IIS URL rewrite module isn't installed\": התקן את URL Rewrite 2.1 (x64) והרץ שוב.",
   "נתקע על Copying Exchange Files 16% בלי שגיאה (CPU 2%, דיסק 0%): סגור את Setup, הוסף חריגי Defender, הפעל מחדש ומפה את ה-ISO מחדש.",
   "אחרי ההתקנה בצע הפעלה מחדש כנדרש, ופתח את EAC: https://localhost/ecp."
  ],
  "ifNotWorking": "אם הלוג מפסיק ב-\"Installing a new product. Package: ...exchangeserver.msi\": זו נעילת MSI שקטה. חריגי Defender פותרים.",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 13). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. ",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "exchange",
   "install",
   "mailbox role",
   "setup",
   "msi"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-19",
  "titleHe": "19 · Exchange: אחרי ההתקנה (EMS, דומיין מייל, כתובות)",
  "titleEn": "Exchange post-install: EMS, accepted domain, addresses",
  "category": "Build",
  "symptom": "חיבור ל-EMS, בדיקת בריאות, הוספת דומיין קבלה אמיתי, ועקיפה של Email Address Policy שלא עובד בסביבה.",
  "commands": [
   {
    "label": "טעינת EMS (בכל session חדש)",
    "text": ". 'C:\\Program Files\\Microsoft\\Exchange Server\\V15\\bin\\RemoteExchange.ps1'\nConnect-ExchangeServer -auto"
   },
   {
    "label": "בריאות שירותים",
    "text": "Test-ServiceHealth"
   },
   {
    "label": "תיבה למשתמש קיים",
    "text": "Enable-Mailbox -Identity \"admin-shlomi\""
   },
   {
    "label": "תיבת בדיקה (תבנית)",
    "text": "New-Mailbox -Name \"shlomi-lab-test\" -UserPrincipalName shlomi-lab-test@lab.local -Password (Read-Host -AsSecureString \"Password\")"
   },
   {
    "label": "דומיין קבלה",
    "text": "New-AcceptedDomain -Name \"corp.example.com\" -DomainName \"corp.example.com\" -DomainType Authoritative"
   },
   {
    "label": "כתובת ראשית ידנית (עוקף Email Address Policy)",
    "text": "Set-Mailbox -Identity \"shlomi-lab-test\" -EmailAddresses @{add=\"test@corp.example.com\"}\nSet-Mailbox -Identity \"shlomi-lab-test\" -PrimarySmtpAddress \"test@corp.example.com\""
   },
   {
    "label": "בדיקת שליחה (תבנית)",
    "text": "Send-MailMessage -From \"admin-shlomi@corp.example.com\" -To \"test@corp.example.com\" -Subject \"test\" -Body \"hello\" -SmtpServer MAIL1"
   },
   {
    "label": "חכה 5 שניות ובדוק Inbox",
    "text": "Start-Sleep -Seconds 5; Get-MailboxFolderStatistics -Identity \"shlomi-lab-test\" -FolderScope Inbox | Select Name,ItemsInFolder"
   },
   {
    "label": "מעקב הודעה",
    "text": "Get-MessageTrackingLog -Sender \"admin-shlomi@corp.example.com\" -Start (Get-Date).AddHours(-1) | Select Timestamp,EventId,Source"
   }
  ],
  "guiSteps": [
   "cmdlets של Exchange זמינים רק ב-EMS (או אחרי טעינת RemoteExchange.ps1). ב-PowerShell רגיל הם לא קיימים.",
   "EAC: https://localhost/ecp (אזהרת תעודה צפויה כי ה-CA הפנימי לא הופץ ללקוחות).",
   "שרשרת תקינה של הודעה במעקב: RECEIVE ← AGENTINFO ← SEND ← DELIVER.",
   "Update-EmailAddressPolicy נכשל במעבדה על כל הנמענים (ManagementObjectNotFoundException) בלי סיבת תשתית. הפתרון: Set-Mailbox ישיר.",
   "אזהרת \"no settings have been modified\" בהרצת שני Set-Mailbox ברצף היא קוסמטית, והשינוי נקלט."
  ],
  "ifNotWorking": "אם נראה שהפקודה לא פעלה, חכה כמה שניות ובדוק שוב (Get-Mailbox | Select PrimarySmtpAddress,EmailAddresses).",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 13). פקודות שמסומנות \"תבנית\" הן נוסחה סטנדרטית ולא הועתקו מהדוח. דומיין המייל בדוח הוא placeholder (corp.example.com).",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "exchange",
   "ems",
   "accepted domain",
   "mailbox",
   "email address policy"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-20",
  "titleHe": "20 · Exchange: פקודות EMS ליום-יום",
  "titleEn": "Exchange: daily EMS commands",
  "category": "Build",
  "symptom": "טבלת עזר לניהול תיבות, קבוצות תפוצה, תורים, מסדי נתונים ומחברים. קודם טען EMS (רשומה 19).",
  "commands": [
   {
    "label": "כל התיבות",
    "text": "Get-Mailbox"
   },
   {
    "label": "סטטיסטיקה לתיבה",
    "text": "Get-MailboxStatistics -Identity \"name\""
   },
   {
    "label": "הודעות ב-Inbox",
    "text": "Get-MailboxFolderStatistics -Identity \"name\" -FolderScope Inbox"
   },
   {
    "label": "מכסת שליחה",
    "text": "Set-Mailbox -Identity \"name\" -ProhibitSendQuota 2GB"
   },
   {
    "label": "ניתוק תיבה (ניתן לשחזור)",
    "text": "Disable-Mailbox -Identity \"name\""
   },
   {
    "label": "מחיקה לצמיתות (זהירות! מוחק גם את משתמש ה-AD)",
    "text": "Remove-Mailbox -Identity \"name\""
   },
   {
    "label": "קבוצת תפוצה",
    "text": "New-DistributionGroup -Name \"group\" -Members \"user1\",\"user2\""
   },
   {
    "label": "חברים בקבוצה",
    "text": "Get-DistributionGroupMember -Identity \"group\""
   },
   {
    "label": "תורי Transport",
    "text": "Get-Queue"
   },
   {
    "label": "הודעות תקועות בתור",
    "text": "Get-Message -Queue \"MAIL1\\3\""
   },
   {
    "label": "ניסיון חוזר לתור",
    "text": "Retry-Queue -Identity \"MAIL1\\3\""
   },
   {
    "label": "מעקב לפי שולח ונמען",
    "text": "Get-MessageTrackingLog -Sender \"a@lab.local\" -Recipients \"b@lab.local\" -Start (Get-Date).AddHours(-1)"
   },
   {
    "label": "מסדי נתונים",
    "text": "Get-MailboxDatabase -Status"
   },
   {
    "label": "מחבר שליחה",
    "text": "Get-SendConnector"
   },
   {
    "label": "מחבר קבלה",
    "text": "Get-ReceiveConnector"
   },
   {
    "label": "בדיקת זרימת דואר",
    "text": "Test-MailFlow"
   },
   {
    "label": "תעודות",
    "text": "Get-ExchangeCertificate"
   },
   {
    "label": "מי באיזה תפקיד ניהול",
    "text": "Get-ManagementRoleAssignment -RoleAssignee \"admin-shlomi\""
   },
   {
    "label": "חברי Organization Management",
    "text": "Get-RoleGroupMember \"Organization Management\""
   },
   {
    "label": "ייצוא לקובץ",
    "text": "Get-Mailbox | Export-Csv C:\\mailboxes.csv -NoTypeInformation"
   }
  ],
  "guiSteps": [
   "טען EMS: \". C:\\Program Files\\Microsoft\\Exchange Server\\V15\\bin\\RemoteExchange.ps1\" ואז Connect-ExchangeServer -auto.",
   "לכל cmdlet: Get-Help <cmdlet> -Examples. הוסף | Format-List כדי לראות את כל השדות."
  ],
  "ifNotWorking": "",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור נספח EMS). ",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "exchange",
   "ems",
   "mailbox",
   "queue",
   "message tracking"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "build-21",
  "titleHe": "21 · קטלוג תקלות מהבנייה: תסמין ← פתרון",
  "titleEn": "Build troubleshooting catalog",
  "category": "Build",
  "symptom": "כל התקלות האמיתיות שנתקלת בהן במעבדה, בקיצור, לפי סדר ההקמה.",
  "commands": [
   {
    "label": "פרופיל רשת ו-ping",
    "text": "Set-NetConnectionProfile -NetworkCategory Private; Enable-NetFirewallRule -DisplayName \"*Echo Request*\""
   },
   {
    "label": "SQL תקוע ב-Single User",
    "text": "Restart-Service MSSQLSERVER -Force"
   },
   {
    "label": "DC: רשומות DNS חסרות",
    "text": "nltest /dsregdns"
   },
   {
    "label": "Netlogon ורישום",
    "text": "Restart-Service Netlogon -Force; ipconfig /registerdns"
   }
  ],
  "guiSteps": [
   "Ping בין שרתים נכשל ← פרופיל Public ו-Echo Request כבוי ← Private והפעלת הכלל.",
   "Install-ADDSForest נכשל על סיסמה ← net user Administrator * (ב-VMware Easy Install השדה ריק).",
   "New-RDSessionDeployment נכשל על PowerShell remoting ← Loopback Check, והתחברות כמשתמש דומיין ולא מנהל מקומי.",
   "Name Not Found בהוספת Staff ל-Collection ← זה OU ולא קבוצת אבטחה. צור קבוצה.",
   "RDP נחסם למנהל ← הוסף את IT-Admins ל-UserGroup של ה-Collection.",
   "SQL Setup נכשל (9001, msdb) ו-\"single user mode\" ← Restart-Service MSSQLSERVER -Force.",
   "Certificate types are not available ← gpupdate /force והמתנה, אז בקש שוב.",
   "Name Not Found בהרשאת מפתח פרטי ← NT SERVICE\\MSSQLSERVER בפורמט מלא ובמיקום המחשב המקומי.",
   "SQL לא עלה אחרי TLS ← Restart-Service שוב (הצליח בניסיון השני).",
   "dcdiag נכשל ב-DC2 (SRV חסרים, 1988) ← פרופיל Public ל-Private + Netlogon + registerdns.",
   "Join נכשל \"user name or password is incorrect\" ← בדוק הקלדה, אמת שהחשבון לא נעול.",
   "Internal ב-VPN1 חזר ל-DHCP אחרי Join ← כבה DHCP והגדר סטטי מחדש.",
   "טווח VPN הראה Number 277 ← טעות באוקטט האחרון, מחק והזן מחדש (צריך 21).",
   "certreq -submit RPC server unavailable ← הרצה כמשתמש מקומי, התחבר כמשתמש דומיין.",
   "IP Address Conflict (Duplicate, נפילה ל-APIPA) על .174 ← arp ממכונה אחרת הראה MAC של VMware אחר; הוקצתה כתובת חלופית (.180). DefaultGateway already exists ← ה-Gateway שייך לממשק, אז הוסף כתובת חדשה בלי לציין Gateway שוב.",
   "Web-Lgcy-Mgmt-Console לא קיים ← הרשימה המתוקנת לשרת 2025 ברשומה 16.",
   "Exchange Setup קורס מיד ← קונסולה קלאסית ולא Windows Terminal.",
   "לולאת קריסה Hypervisor launch failed ← כיבוי hypervisorlaunchtype ו-VBS.",
   "UAC מבקש סיסמה ← הוסף כ-Local Administrator, והתחבר מחדש.",
   "ldifde 8224 ← DC2 כבוי או _msdcs חסר ← nltest /dsregdns ו-repadmin /replicate.",
   "הדגל הישן לא מספיק ← _DiagnosticDataOFF/ON.",
   "Mount-DiskImage 0x80070522 ← PowerShell לא מורם (Run as administrator).",
   "Prerequisite: URL Rewrite חסר ← התקן 2.1 x64.",
   "תקוע על 16% ← חריגי Defender.",
   "Update-EmailAddressPolicy נכשל ← Set-Mailbox -EmailAddresses / -PrimarySmtpAddress."
  ],
  "ifNotWorking": "",
  "notes": "מקור: דוח מעבדת Windows Server 2025 (שיעור 1-13). ",
  "tags": [
   "מעבדה",
   "lab",
   "בניית דומיין",
   "build",
   "troubleshooting",
   "תקלות",
   "catalog",
   "errors"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ra-rdp-orphan-session",
  "titleHe": "RDP תקוע על Welcome: סשן יתום ו-TermService תקוע",
  "titleEn": "RDP hangs at \"Welcome\": orphaned session, TermService stuck in STOP_PENDING",
  "category": "Remote Access",
  "symptom": "משתמש מתחבר ב-RDP ונתקע על מסך Welcome, או שהחיבור לא נפתח בכלל. query user ו-qwinsta נתקעות (גם מרחוק). Get-Service TermService מראה Running אבל מטעה: שירות פועל לא אומר שהוא עונה. לרוב הקדים אותה ניתוק של חלון ה-RDP באמצע הכניסה (למשל בהמתנה לאישור Duo). חומרה גבוהה: אף משתמש חדש לא מתחבר.",
  "commands": [
   {
    "label": "אבחון 1: תהליכי כניסה בסשן שאינו הקונסולה (יתומים)",
    "text": "Get-Process winlogon, LogonUI -ErrorAction SilentlyContinue | ft Id, SessionId, CPU"
   },
   {
    "label": "אבחון 2: מצב אמיתי של השירות (STOP_PENDING = תקוע, רשום את ה-PID)",
    "text": "sc.exe queryex TermService"
   },
   {
    "label": "אבחון 3: שגיאות אחרונות ביומן System",
    "text": "Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2; StartTime=(Get-Date).AddHours(-3)} -MaxEvents 15 | ft TimeCreated, ProviderName, Message -Wrap"
   },
   {
    "label": "אבחון 4: עדכונים אחרונים (לשלול עדכון לא תקין)",
    "text": "Get-HotFix | Sort InstalledOn -Descending | Select -First 5"
   },
   {
    "label": "אישור שהתהליך מארח רק שירותי RDP",
    "text": "tasklist /svc /fi \"PID eq <PID>\""
   },
   {
    "label": "הריגה והפעלה מחדש",
    "text": "taskkill /F /PID <PID>\nStart-Service TermService\nqwinsta"
   },
   {
    "label": "ניקוי סשן יתום שנשאר",
    "text": "logoff <ID>"
   },
   {
    "label": "אם לא נסגר",
    "text": "reset session <ID>"
   },
   {
    "label": "מוצא אחרון (בייצור: אחרי שהמשתמשים שמרו עבודה)",
    "text": "Restart-Computer -Force"
   },
   {
    "label": "בדיקה אחרי התיקון",
    "text": "mstsc /v:<server>"
   }
  ],
  "guiSteps": [
   "גש לשרת דרך קונסולת ה-VM / iLO / hypervisor כמנהל (לא דרך RDP).",
   "אל תנסה Restart-Service TermService -Force ולהמתין. אם מופיע \"Waiting for service to stop...\", לחץ Ctrl+C.",
   "מצא PID עם sc.exe queryex TermService, ואשר עם tasklist /svc שהתהליך מארח רק שירותי RDP. אז taskkill ו-Start-Service.",
   "qwinsta אמורה להחזיר: services (0), console (1), rdp-tcp (65536, Listen).",
   "Task Manager ← Users ← קליק ימני על המשתמש ← Sign off (ניקוי סשן רגיל).",
   "Task Manager ← Details ← קליק ימני על כותרת ← Select columns ← Session ID, לזיהוי winlogon / LogonUI יתומים.",
   "services.msc ← Remote Desktop Services ← אם Stopping: Task Manager ← Services ← קליק ימני ← Go to details ← End task.",
   "מניעה: GPO על ה-OU של שרתי ה-Terminal: Computer Configuration ← Administrative Templates ← Windows Components ← Remote Desktop Services ← Remote Desktop Session Host ← Session Time Limits ← Set time limit for disconnected sessions ← Enabled, 1 hour.",
   "אחרי התיקון: בדוק mstsc, ואם יש MFA גם שההודעה מגיעה."
  ],
  "ifNotWorking": "אם TermService עדיין לא עולה אחרי taskkill: בדוק שוב sc.exe queryex ואת יומן System, ואם צריך Restart-Computer -Force (בייצור אחרי שהמשתמשים שמרו).",
  "notes": "⚠️ לעולם אל תעצור את winlogon של סשן הקונסולה (סשן 1): זה מקריס את השרת. ממצא במעבדה (TS1, Windows Server 2025, 17/10/2026): קריסה של RdpIdd.dll (Microsoft Remote Display Adapter) ביומן System בדיוק בניתוק החיבור; winlogon ו-LogonUI בסשן 4 (יתום); TermService ב-STOP_PENDING. סיבה משוערת: ניתוק באמצע תהליך כניסה עם Duo MFA ממתין. לא הוכח ש-Duo הוא הגורם, ורק שחזור יאשר. לא עדכון Windows: העדכונים הותקנו חודש קודם ו-RDP עבד אחריהם. בתקלה דומה בארגון, הסרה עם wusa /uninstall /kb:<מספר> סבירה אחרי אימות. ה-GPO מנקה סשנים מנותקים אבל לא פותר סשן שנתקע לפני שהמשתמש נכנס. רעש ביומן שאפשר להתעלם ממנו: \"Secure Boot is not enabled\" (VM), \"immersivecontrolpanel did not register with DCOM\" (חסימת Settings ב-GPO). לשאול את המשתמש: האם סגרת את החלון בלי Sign out? עד איזה מסך הגעת (Welcome / Duo / שולחן עבודה)? האם אחרים מתחברים לאותו שרת?",
  "tags": [
   "rdp",
   "termservice",
   "stuck",
   "תקוע",
   "סשן",
   "session",
   "welcome",
   "orphan",
   "יתום",
   "qwinsta",
   "winlogon",
   "duo",
   "ts1"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ad-repl-8524",
  "titleHe": "שגיאת שכפול 8524 (כשל DNS) ו-1256",
  "titleEn": "AD replication errors 8524 and 1256",
  "category": "AD",
  "symptom": "repadmin /replsummary מציג כשלונות ו-/showrepl מציג 8524: \"The DSA operation is unable to proceed because of a DNS lookup failure\". שינוי משתמש או סיסמה בבקר אחד לא מופיע בשני, ולעיתים חוזר אחרי הפעלה מחדש של בקר. חומרה בינונית.",
  "commands": [
   {
    "label": "אבחון: סיכום שכפול",
    "text": "repadmin /replsummary"
   },
   {
    "label": "אבחון: פירוט ושגיאות",
    "text": "repadmin /showrepl"
   },
   {
    "label": "אבחון DNS על הבקר הבעייתי",
    "text": "dcdiag /test:dns /v"
   },
   {
    "label": "סדר שרתי ה-DNS בכרטיס",
    "text": "Get-DnsClientServerAddress -InterfaceAlias \"<NIC>\""
   },
   {
    "label": "פתרון על הבקר הבעייתי: רישום DNS מחדש",
    "text": "ipconfig /registerdns\nnltest /dsregdns\nRestart-Service netlogon"
   },
   {
    "label": "אחר כך על הבקר השני (מצפים ל-0 כשלונות)",
    "text": "repadmin /syncall /Ade\nrepadmin /replsummary"
   },
   {
    "label": "מניעה בבקר משני: הבקר השותף ראשון, 127.0.0.1 אחרון",
    "text": "Set-DnsClientServerAddress -InterfaceAlias \"<NIC>\" -ServerAddresses <DC-PARTNER-IP>,127.0.0.1"
   },
   {
    "label": "שגיאה 1256: בדיקת קישוריות בין הבקרים",
    "text": "Test-NetConnection <DC-IP> -Port 389"
   }
  ],
  "guiSteps": [
   "dssite.msc ← Sites ← Servers ← NTDS Settings ← קליק ימני על חיבור ← Replicate Now.",
   "dnsmgmt.msc ← לבדוק שרשומות _msdcs של הבקר קיימות.",
   "שגיאה 1256 (הבקר השני לא זמין): לשחזר קישוריות, אחר כך repadmin /syncall /Ade. אחרי שינוי רשת או חומה לוודא שהפורטים של AD פתוחים בין הבקרים: DNS, Kerberos, LDAP, SMB, RPC."
  ],
  "ifNotWorking": "אם 8524 נשארת: dcdiag /test:dns /v, ובדוק שאזור _msdcs קיים ומתעדכן ושסדר ה-DNS בכרטיס נכון.",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 01. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. 8524 כמעט תמיד DNS ולא השכפול עצמו. סדר הטיפול: DNS ← רישום ← syncall ← אימות. כדאי לשמור צילום של replsummary לפני ואחרי. סיבות נפוצות: הבקר לא רשם את הרשומות שלו (במיוחד אחרי הפעלה), 127.0.0.1 ראשון בבקר משני, אזור _msdcs חסר.",
  "tags": [
   "replication",
   "שכפול",
   "8524",
   "1256",
   "repadmin",
   "dns",
   "dcdiag",
   "netlogon",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ad-script-prepare-dc",
  "titleHe": "סקריפט: יצירת OU ומשתמש תרגול ב-DC",
  "titleEn": "Script: create practice OUs and user on a DC",
  "category": "AD",
  "symptom": "הכנת סביבת תרגול על בקר דומיין: OU חדשים ומשתמש רגיל (לא אדמין), בלי לכתוב מחדש פעמיים. הסקריפט בודק אם קיים לפני יצירה. מריצים על DC.",
  "commands": [
   {
    "label": "הפעלה (ברירת מחדל: OU בשם LabUsers ו-LabComputers)",
    "text": ".\\AD-00-Prepare-DC.ps1 -UserName jdoe"
   },
   {
    "label": "הפעלה עם OU בשמות אחרים",
    "text": ".\\AD-00-Prepare-DC.ps1 -UserName jdoe -OuNames 'PracticeUsers','PracticeComputers' -UserOu 'PracticeUsers'"
   },
   {
    "label": "הסקריפט המלא",
    "text": "#Requires -Modules ActiveDirectory\nparam(\n    [Parameter(Mandatory)][string]$UserName,\n    [string[]]$OuNames = @('LabUsers', 'LabComputers'),\n    [string]$UserOu = 'LabUsers'\n)\n\n$domain   = Get-ADDomain\n$domainDN = $domain.DistinguishedName\n\nforeach ($ou in $OuNames) {\n    if (-not (Get-ADOrganizationalUnit -Filter \"Name -eq '$ou'\" -SearchBase $domainDN -SearchScope OneLevel)) {\n        New-ADOrganizationalUnit -Name $ou -Path $domainDN -ProtectedFromAccidentalDeletion $true\n        Write-Host \"Created OU: $ou\" -ForegroundColor Green\n    }\n}\n\nif (-not (Get-ADUser -Filter \"SamAccountName -eq '$UserName'\")) {\n    New-ADUser -Name $UserName -GivenName $UserName -SamAccountName $UserName `\n        -UserPrincipalName \"$UserName@$($domain.DNSRoot)\" `\n        -Path \"OU=$UserOu,$domainDN\" `\n        -AccountPassword (Read-Host \"Password for $UserName\" -AsSecureString) `\n        -Enabled $true -PasswordNeverExpires $false\n    Write-Host \"Created user: $UserName\" -ForegroundColor Green\n} else { Write-Host \"User $UserName already exists.\" -ForegroundColor Yellow }\n\nWrite-Host \"`nIf clients must reach the internet while using this DC as DNS, make sure the DC has a DNS forwarder:\"\nWrite-Host \"  Add-DnsServerForwarder -IPAddress <PUBLIC-DNS-IP>\""
   },
   {
    "label": "Forwarder ב-DNS של ה-DC (כדי שלקוחות יגיעו לאינטרנט)",
    "text": "Add-DnsServerForwarder -IPAddress <PUBLIC-DNS-IP>"
   }
  ],
  "guiSteps": [
   "dsa.msc ← קליק ימני על הדומיין ← New ← Organizational Unit.",
   "משתמש: קליק ימני על ה-OU ← New ← User."
  ],
  "ifNotWorking": "",
  "notes": "מקור: חבילת הפרקים הכללית, פרק סקריפט AD-00-Prepare-DC.ps1. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. הסיסמה נשאלת בהרצה ולא נשמרת בקובץ.",
  "tags": [
   "script",
   "סקריפט",
   "ou",
   "new-aduser",
   "prepare",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ad-script-join-domain",
  "titleHe": "סקריפט: הצטרפות תחנה לדומיין (עם בדיקות)",
  "titleEn": "Script: join a workstation to the domain",
  "category": "AD",
  "symptom": "לפני Add-Computer: בדיקת מהדורת Windows (Home לא מצטרף), נקודת שחזור, DNS לבקר ובדיקות LDAP. מריצים על התחנה כמנהל.",
  "commands": [
   {
    "label": "הפעלה",
    "text": ".\\AD-00-Join-Domain.ps1 -DomainName <DOMAIN-FQDN> -DcIp <DC-IP>"
   },
   {
    "label": "עם OU למחשבים",
    "text": ".\\AD-00-Join-Domain.ps1 -DomainName <DOMAIN-FQDN> -DcIp <DC-IP> -ComputerOU \"OU=<COMPUTERS-OU>,DC=<domain>,DC=<tld>\""
   },
   {
    "label": "הסקריפט המלא",
    "text": "#Requires -RunAsAdministrator\nparam(\n    [Parameter(Mandatory)][string]$DomainName,\n    [Parameter(Mandatory)][string]$DcIp,\n    [string]$ComputerOU\n)\n\n$edition = (Get-CimInstance Win32_OperatingSystem).Caption\nWrite-Host \"OS: $edition\"\nif ($edition -match 'Home') { throw \"Windows Home cannot join a domain. Upgrade to Pro first.\" }\n\nGet-LocalGroupMember Administrators | Format-Table Name, ObjectClass -AutoSize\n\ntry {\n    Enable-ComputerRestore -Drive \"$env:SystemDrive\\\"\n    Checkpoint-Computer -Description \"Before domain join\" -RestorePointType MODIFY_SETTINGS\n    Write-Host \"Restore point created.\" -ForegroundColor Green\n} catch { Write-Warning \"Restore point failed: $($_.Exception.Message)\" }\n\n$nic = Get-NetAdapter | Where-Object Status -eq 'Up' | Select-Object -First 1\nSet-DnsClientServerAddress -InterfaceIndex $nic.ifIndex -ServerAddresses $DcIp\nClear-DnsClientCache\n\nif (-not (Resolve-DnsName $DomainName -ErrorAction SilentlyContinue)) { throw \"Cannot resolve $DomainName via $DcIp\" }\nif (-not (Test-NetConnection $DcIp -Port 389 -InformationLevel Quiet)) { throw \"LDAP port 389 on $DcIp unreachable\" }\n\n$params = @{ DomainName = $DomainName; Credential = (Get-Credential -Message \"Domain admin\"); Force = $true }\nif ($ComputerOU) { $params.OUPath = $ComputerOU }\nAdd-Computer @params\nWrite-Host \"Joined. Restarting in 10 seconds...\" -ForegroundColor Green\nStart-Sleep 10; Restart-Computer"
   }
  ],
  "guiSteps": [
   "sysdm.cpl ← Change ← Member of: Domain ← שם הדומיין ← פרטי מנהל דומיין.",
   "לפני כן: ncpa.cpl ← IPv4 ← DNS מצביע לבקר הדומיין.",
   "אחרי אתחול: כניסה כ-DOMAIN\\user."
  ],
  "ifNotWorking": "אם \"Cannot resolve\": ה-DNS של התחנה לא מצביע לבקר, או שהבקר לא נגיש (LDAP 389).",
  "notes": "מקור: חבילת הפרקים הכללית, פרק סקריפט AD-00-Join-Domain.ps1. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. חשבונות מקומיים קיימים לא נפגעים. מוודאים לפני ההצטרפות שיש אדמין מקומי כדרך חזרה.",
  "tags": [
   "script",
   "סקריפט",
   "join",
   "add-computer",
   "domain join",
   "הצטרפות",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ad-script-fix-locked",
  "titleHe": "סקריפט: אבחון ופתיחת חשבון נעול",
  "titleEn": "Script: diagnose and unlock a locked account",
  "category": "AD",
  "symptom": "סקריפט שמראה את מצב החשבון, מוצא את מקור הנעילה (אירוע 4740 ב-PDC), פותח, ואופציונלית מאפס סיסמה עם החלפה בכניסה הבאה.",
  "commands": [
   {
    "label": "הפעלה",
    "text": ".\\AD-01-Fix-LockedAccount.ps1 -User jdoe"
   },
   {
    "label": "עם איפוס סיסמה",
    "text": ".\\AD-01-Fix-LockedAccount.ps1 -User jdoe -ResetPassword"
   },
   {
    "label": "הסקריפט המלא",
    "text": "#Requires -Modules ActiveDirectory\nparam(\n    [Parameter(Mandatory)][string]$User,\n    [switch]$ResetPassword\n)\n\n$u = Get-ADUser $User -Properties LockedOut, PasswordExpired, PasswordLastSet, BadLogonCount, LastBadPasswordAttempt, Enabled\n$u | Select-Object Name, Enabled, LockedOut, PasswordExpired, PasswordLastSet, BadLogonCount, LastBadPasswordAttempt | Format-List\n\n$pdc = (Get-ADDomain).PDCEmulator\nWrite-Host \"`nLockout events on $pdc :\" -ForegroundColor Cyan\ntry {\n    Get-WinEvent -ComputerName $pdc -FilterHashtable @{LogName='Security'; Id=4740} -MaxEvents 50 -ErrorAction Stop |\n        Where-Object { $_.Properties[0].Value -eq $User } |\n        Select-Object -First 5 TimeCreated, @{n='CallerComputer';e={$_.Properties[1].Value}} |\n        Format-Table -AutoSize\n} catch { Write-Warning \"Could not read Security log: $($_.Exception.Message)\" }\n\nif ($u.LockedOut) {\n    Unlock-ADAccount -Identity $User\n    Write-Host \"Account unlocked.\" -ForegroundColor Green\n} else {\n    Write-Host \"Account is not locked.\" -ForegroundColor Yellow\n}\n\nif ($ResetPassword) {\n    $pw = Read-Host \"New password\" -AsSecureString\n    Set-ADAccountPassword -Identity $User -Reset -NewPassword $pw\n    Set-ADUser -Identity $User -ChangePasswordAtLogon $true\n    Write-Host \"Password reset; must change at next logon.\" -ForegroundColor Green\n}"
   },
   {
    "label": "בלי סקריפט: כל החשבונות הנעולים",
    "text": "Search-ADAccount -LockedOut | ft Name, SamAccountName"
   }
  ],
  "guiSteps": [
   "dsa.msc ← המשתמש ← Account ← Unlock account.",
   "מדיניות הנעילה: Default Domain Policy ← Computer Configuration ← Policies ← Windows Settings ← Security Settings ← Account Policies ← Account Lockout Policy."
  ],
  "ifNotWorking": "נעילה חוזרת: מצא את Caller Computer Name באירוע 4740 וטפל במקור (כונן ממופה, משימה מתוזמנת, טלפון, סשן RDP ישן, VPN שמור עם סיסמה ישנה).",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 02 + AD-01. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. כלל מרכזי: קודם מוצאים את המקור ורק אחר כך פותחים. לצלם את אירוע 4740 עם שם המכונה.",
  "tags": [
   "script",
   "lockout",
   "נעול",
   "נעילה",
   "4740",
   "unlock",
   "pdc",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "gpo-share-drive-map",
  "titleHe": "הרשאות משותף ומיפוי כונן ב-GPO",
  "titleEn": "Shared folder permissions via groups and GPP drive mapping",
  "category": "GPO",
  "symptom": "משתמש צריך גישה לתיקייה משותפת ולכונן ממופה אוטומטית. העיקרון: הרשאות לקבוצות, מיפוי עם Item-level targeting לפי הקבוצה.",
  "commands": [
   {
    "label": "קבוצה והוספת משתמש",
    "text": "New-ADGroup -Name \"<GROUP-RW>\" -GroupScope Global -Path \"<OU-DN>\"\nAdd-ADGroupMember -Identity \"<GROUP-RW>\" -Members <USER>"
   },
   {
    "label": "בשרת הקבצים: הרשאות Share",
    "text": "Get-SmbShareAccess -Name \"<SHARE>\""
   },
   {
    "label": "בשרת הקבצים: הרשאות NTFS",
    "text": "icacls \"<LOCAL-PATH>\""
   },
   {
    "label": "אימות אצל המשתמש",
    "text": "gpupdate /force\ngpresult /r\nwhoami /groups | findstr <GROUP-RW>\nnet use"
   },
   {
    "label": "חיפוש נתב GPO מלא",
    "text": "gpresult /h report.html"
   }
  ],
  "guiSteps": [
   "gpmc.msc ← צור GPO (למשל Map-<LETTER>-Drive) וקשר ל-OU של המשתמשים.",
   "User Configuration ← Preferences ← Windows Settings ← Drive Maps ← New ← Mapped Drive.",
   "Location: \\\\<FILE-SERVER>\\<SHARE>, Drive Letter: <LETTER>:.",
   "לשונית Common ← Item-level targeting ← Targeting ← New Item ← Security Group ← <GROUP-RW>.",
   "ההרשאה האפקטיבית היא המגבילה מבין Share ו-NTFS. בדרך כלל Share פתוח לקבוצות והבקרה ב-NTFS.",
   "בדיקת טירגוט: להסיר את המשתמש מהקבוצה, Sign out/in, ולוודא שהכונן נעלם."
  ],
  "ifNotWorking": "כונן נשאר אחרי הסרה מקבוצה: טוקן ישן או Action=Create. Sign out/in, ובמיפוי להשתמש ב-Update/Replace.",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 03. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. חברות בקבוצה נכנסת לטוקן רק בכניסה חדשה (Sign out/in). תקלות: כונן לא מופיע ← משתמש לא בקבוצה או טוקן ישן; מופיע אבל גישה נדחית ← הרשאות Share/NTFS; ה-GPO לא ב-gpresult ← קישור ל-OU שגוי או Security Filtering.",
  "tags": [
   "drive map",
   "מיפוי כונן",
   "share",
   "ntfs",
   "permissions",
   "הרשאות",
   "gpp",
   "item-level targeting",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "gpo-ts-lockdown",
  "titleHe": "הקשחת Terminal Server ב-GPO (Loopback)",
  "titleEn": "Terminal Server lockdown with GPO (loopback)",
  "category": "GPO",
  "symptom": "משתמש רגיל ב-Terminal Server מקבל סביבה מוגבלת (בלי Control Panel, שורת פקודה, PowerShell, רגדיט וכונן המערכת) ומנהלים לא מושפעים.",
  "commands": [
   {
    "label": "החלה ובדיקה",
    "text": "gpupdate /force\ngpresult /r /scope:user"
   }
  ],
  "guiSteps": [
   "מבנה: GPO בשם TS-Lockdown מקושר ל-OU של שרתי ה-Terminal (אובייקטי מחשב).",
   "Loopback: Computer Configuration ← Administrative Templates ← System ← Group Policy ← Configure user Group Policy loopback processing mode ← Enabled, Mode: Merge. הסיבה: ההגבלות הן הגדרות משתמש, וה-GPO מקושר ל-OU של מחשבים.",
   "User Configuration ← Policies ← Administrative Templates: Control Panel ← Prohibit access to Control Panel and PC settings.",
   "System ← Prevent access to the command prompt (Disable script processing: No).",
   "System ← Don't run specified Windows applications: powershell.exe, powershell_ise.exe, pwsh.exe, wt.exe, ServerManager.exe.",
   "System ← Prevent access to registry editing tools.",
   "Windows Components ← File Explorer ← Hide these specified drives in My Computer + Prevent access to drives from My Computer.",
   "Start Menu and Taskbar ← Remove Run menu from Start Menu.",
   "החרגת מנהלים: gpmc.msc ← ה-GPO ← Delegation ← Advanced ← Add קבוצות מנהלים ← Deny על Apply group policy.",
   "אימות: משתמש רגיל נחסם ב-Control Panel וב-PowerShell, מנהל פועל חופשי."
  ],
  "ifNotWorking": "ההגבלות לא חלות: חסר Loopback, או שה-GPO לא מקושר ל-OU של השרת. גם מנהל מוגבל: ה-Deny לא הוגדר. שינוי לא נקלט: Sign out/in (מדיניות משתמש נטענת בכניסה).",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 04. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. לבדוק תמיד גם עם מנהל כדי לא לנעול את עצמך מחוץ לשרת. חסימה ב-GPO היא שכבה אחת ולא תחליף להרשאות NTFS והקשחת השרת. אם שם הגדרה שונה בגרסה שלך, חפש בשורת החיפוש של העורך.",
  "tags": [
   "terminal server",
   "lockdown",
   "loopback",
   "הקשחה",
   "rds",
   "gpo",
   "restrictions",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ra-rdp-group-access",
  "titleHe": "מתן גישת RDP לקבוצה (Remote Desktop Users)",
  "titleEn": "Grant RDP access to a server for a domain group",
  "category": "Remote Access",
  "symptom": "משתמש צריך להתחבר בשולחן עבודה מרוחק לשרת. לא מוסיפים משתמשים אחד אחד: קבוצת דומיין שמוספת ל-Remote Desktop Users המקומית בשרת.",
  "commands": [
   {
    "label": "בבקר הדומיין",
    "text": "New-ADGroup -Name \"<GROUP>\" -GroupScope Global -Path \"<OU-DN>\"\nAdd-ADGroupMember -Identity \"<GROUP>\" -Members <USER>"
   },
   {
    "label": "בשרת היעד",
    "text": "Add-LocalGroupMember -Group \"Remote Desktop Users\" -Member \"<DOMAIN>\\<GROUP>\"\nGet-LocalGroupMember -Group \"Remote Desktop Users\""
   },
   {
    "label": "אימות חיבור",
    "text": "Test-NetConnection <TS-SERVER> -Port 3389\nmstsc /v:<TS-SERVER>"
   }
  ],
  "guiSteps": [
   "בסביבה גדולה: להגדיר את החברות ב-GPO: Computer Configuration ← Policies ← Windows Settings ← Security Settings ← Restricted Groups (או Preferences ← Local Users and Groups).",
   "חברות חדשה בקבוצה: המשתמש צריך Sign out/in (טוקן)."
  ],
  "ifNotWorking": "אין חיבור בכלל: פורט 3389 חסום, השירות לא רץ או חומת אש (Test-NetConnection ובדיקת Windows Firewall). נתקע על Welcome: ראה \"RDP תקוע על Welcome\".",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 05. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. הודעה \"The connection was denied because the user account is not authorized for remote login\" = המשתמש לא ב-Remote Desktop Users. NLA מקטין חשיפה. אל תחשוף 3389 ישירות לאינטרנט, גישה דרך VPN ועדיף עם MFA. תעבורה באותה רשת לא עוברת בחומה ולא נרשמת.",
  "tags": [
   "rdp",
   "3389",
   "remote desktop users",
   "nla",
   "access",
   "גישה",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "ra-duo-mfa-rdp",
  "titleHe": "Duo MFA לכניסת RDP: התקנה ותרחישים",
  "titleEn": "Duo MFA for RDP logon",
  "category": "Remote Access",
  "symptom": "הוספת שלב אימות בטלפון לכניסה ב-RDP לשרת Windows. כולל טלפון שאבד ו-Duo שדילג על האימות.",
  "commands": [
   {
    "label": "שרת: בדיקת גישה ל-API של Duo (https 443)",
    "text": "Test-NetConnection api-xxxxxxxx.duosecurity.com -Port 443"
   },
   {
    "label": "סשן קיים שגורם ל-Duo לדלג: למצוא ולנתק",
    "text": "query user\nlogoff <ID>"
   }
  ],
  "guiSteps": [
   "Admin Panel ← Applications ← Protect an Application ← Microsoft RDP ← Protect. רושמים Integration key, Secret key, API hostname. המפתחות הם סוד: לא בדוח, לא בקבצים משותפים, לא בצילומי מסך.",
   "Users ← Add User ← אותו שם משתמש כמו ב-AD ← קישור רישום ← Duo Mobile וסריקה.",
   "בשרת: התקנת Duo Authentication for Windows Logon והזנת שלושת הערכים.",
   "הגדרות: FailOpen=off (אם Duo לא זמין, הכניסה נחסמת), Auto push=on, Only prompt for Duo on RDP=on (כניסה בקונסולה ללא Duo, גישת חירום).",
   "בדיקה: mstsc ← סיסמה ← אישור בטלפון. Reports ← Authentication Log ← Granted.",
   "טלפון אבד: Users ← המשתמש ← Bypass Code (חד-פעמי) ← המשתמש מקליד ב-Duo. אחרי טלפון חדש: רישום מחדש ומחיקת המכשיר הישן.",
   "לא משנים Status ל-Bypass (מדלג על Duo ללא הגבלה). אם שונה זמנית, מחזירים ל-Active.",
   "Duo דילג על האימות: לבדוק Status=Bypass, Authentication Log (Result/Reason). אין שורה חדשה בלוג = Duo לא נקרא, אולי חיבור מחדש לסשן קיים."
  ],
  "ifNotWorking": "עם FailOpen=off, בלי גישה ל-API של Duo ב-443 אף אחד לא נכנס. להתיר ליעד הזה בחומה.",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 06. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. סגירת חלון RDP בזמן המתנה לאישור Duo עלולה להשאיר סשן יתום ולתקוע TermService (ראה \"RDP תקוע על Welcome\"). הבדל: Bypass Code חד-פעמי לעומת Status Bypass קבוע.",
  "tags": [
   "duo",
   "mfa",
   "2fa",
   "rdp",
   "bypass",
   "failopen",
   "אימות",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "vpn-sstp-rras-nps-setup",
  "titleHe": "שרת VPN: RRAS + SSTP + NPS (הגדרה מלאה)",
  "titleEn": "VPN server: RRAS + SSTP + NPS setup",
  "category": "VPN",
  "symptom": "VPN גישה מרחוק: SSTP על 443, אימות דרך NPS (RADIUS) מול AD. שרת ה-VPN מומלץ ב-DMZ עם כרטיס יחיד.",
  "commands": [
   {
    "label": "שרת ה-VPN: תפקידים",
    "text": "Install-WindowsFeature RemoteAccess, DirectAccess-VPN, Routing -IncludeManagementTools\nInstall-RemoteAccess -VpnType Vpn"
   },
   {
    "label": "בדיקת קישור תעודה",
    "text": "netsh http show sslcert | findstr /i \"443 Hash\""
   },
   {
    "label": "האם 443 מאזין (PID 4 = HTTP.sys)",
    "text": "netstat -ano | findstr \":443 \" | findstr LISTENING"
   },
   {
    "label": "שירותים",
    "text": "Get-Service RemoteAccess, SstpSvc"
   },
   {
    "label": "אחרי שינוי ספק האימות",
    "text": "Restart-Service RemoteAccess -Force"
   },
   {
    "label": "התקנת NPS",
    "text": "Install-WindowsFeature NPAS -IncludeManagementTools"
   },
   {
    "label": "לקוח: יצירת חיבור (SplitTunneling: רק תעבורת הארגון עוברת)",
    "text": "Add-VpnConnection -Name \"<CONNECTION-NAME>\" -ServerAddress \"<VPN-FQDN>\" -TunnelType Sstp -AuthenticationMethod MSChapv2 -EncryptionLevel Required -SplitTunneling $true"
   },
   {
    "label": "לקוח: מצב",
    "text": "Get-VpnConnection"
   }
  ],
  "guiSteps": [
   "ארכיטקטורה: לקוח ← חומה (443) ← VPN-SERVER ב-DMZ ← RADIUS UDP 1812 ← NPS-SERVER ← AD.",
   "תעודה: מה-CA הפנימי או ציבורי עם Subject/SAN = <VPN-FQDN>, ב-LocalMachine\\My.",
   "קישור התעודה ל-SSTP: rrasmgmt.msc ← קליק ימני על השרת ← Properties ← Security ← SSL Certificate Binding.",
   "ספק האימות (חשוב): Properties ← Security ← Authentication provider ← RADIUS Authentication ← Configure ← Add: NPS-SERVER, Port 1812, Shared secret חזק זהה בשני הצדדים.",
   "בריכת כתובות: Properties ← IPv4 ← Static address pool, טווח שלא מתנגש, והכרטיס (Adapter) הנכון.",
   "NPS (nps.msc): RADIUS Clients ← New ← כתובת ה-IP של שרת ה-VPN כפי שהיא מגיעה ל-NPS ואותו Shared secret.",
   "Network Policies ← New (VPN-Users-Hours): Conditions = Windows Groups + NAS Port Type=Virtual (VPN) + Day and time; Permission=Grant access; Authentication=MS-CHAPv2; Encryption MPPE 128-bit. המדיניות הספציפית מעל ברירות המחדל.",
   "המשתמש ב-AD: dsa.msc ← Dial-in ← Control access through NPS Network Policy, והוא חבר בקבוצת ה-VPN.",
   "חומת אש: 443 TCP לשרת ה-VPN, 1812/1813 UDP בין VPN ל-NPS, DNS/Kerberos/LDAP/NTP לבקרים, 80/443 החוצה לעדכונים ו-CRL, ולקוחות VPN רק למה שנדרש.",
   "בדיקת הצלחה: בחומה 443 נכנס ואז 1812; ב-NPS אירוע 6272 (אושר); בלקוח Connected וכתובת מהבריכה."
  ],
  "ifNotWorking": "אם ספק האימות נשאר Windows Authentication, מדיניות NPS לא חלה ומשתמשים עם Dial-in=Control access through NPS נדחים.",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 08. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. בייצור לשפר: MS-CHAPv2 חלש, עדיפים EAP-TLS או PEAP; להוסיף MFA (NPS Extension); תעודה עם נתיב CRL ב-HTTP נגיש מבחוץ; לא לחשוף את NPS לאינטרנט. לבדוק גם דחייה מחוץ לשעות (אירוע 6273).",
  "tags": [
   "vpn",
   "sstp",
   "rras",
   "nps",
   "radius",
   "dmz",
   "הגדרה",
   "setup",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "vpn-0x80092013",
  "titleHe": "VPN: שגיאה 0x80092013 (בדיקת ביטול תעודה נכשלה)",
  "titleEn": "VPN error 0x80092013 (revocation check failed)",
  "category": "VPN",
  "symptom": "\"The revocation function was unable to check revocation because the revocation server was offline\". הלקוח מבחוץ לא מצליח לבדוק אם התעודה בוטלה.",
  "commands": [
   {
    "label": "עוקף למעבדה בלבד (בצד הלקוח)",
    "text": "reg add HKLM\\SYSTEM\\CurrentControlSet\\Services\\SstpSvc\\Parameters /v NoCertRevocationCheck /t REG_DWORD /d 1 /f\nRestart-Service SstpSvc -Force"
   },
   {
    "label": "מחיקת העוקף אחרי הבדיקה",
    "text": "reg delete HKLM\\SYSTEM\\CurrentControlSet\\Services\\SstpSvc\\Parameters /v NoCertRevocationCheck /f\nRestart-Service SstpSvc -Force"
   }
  ],
  "guiSteps": [
   "פתרון אמיתי: ב-CA להוסיף נתיב CDP ב-HTTP הנגיש מבחוץ ולהנפיק מחדש את התעודה."
  ],
  "ifNotWorking": "",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 09. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. הסיבה: התעודה מפנה ל-CRL רק דרך LDAP (פנימי). העוקף הוא למעבדה בלבד ואסור להשאיר בייצור.",
  "tags": [
   "vpn",
   "0x80092013",
   "crl",
   "revocation",
   "certificate",
   "sstp",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "vpn-terminated-20271",
  "titleHe": "VPN: \"The connection was terminated by the remote computer\"",
  "titleEn": "VPN: connection terminated by the remote computer",
  "category": "VPN",
  "symptom": "החיבור מגיע לשרת ונסגר בשלב מאוחר. ההודעה כללית ולא מסבירה את הסיבה.",
  "commands": [
   {
    "label": "בשרת ה-VPN: אירועי RemoteAccess ו-Schannel",
    "text": "Get-WinEvent -LogName System -MaxEvents 25 | ? ProviderName -match 'RemoteAccess|Rras|RasSstp|Schannel' |\n  ft TimeCreated, ProviderName, Id, Message -Wrap"
   },
   {
    "label": "אחרי תיקון ספק האימות",
    "text": "Restart-Service RemoteAccess -Force"
   }
  ],
  "guiSteps": [
   "Event Viewer ← System, שרת ה-VPN: אירוע 20271 (\"the account does not have permission to dial in\") או 20258.",
   "סיבה נפוצה: ספק האימות ב-RRAS הוא Windows Authentication והמשתמש מוגדר Control access through NPS Network Policy: אין מי שיאשר.",
   "פתרון: rrasmgmt.msc ← Properties ← Security ← RADIUS Authentication. זמנית: Allow access על המשתמש (עוקף NPS)."
  ],
  "ifNotWorking": "",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 09. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. ",
  "tags": [
   "vpn",
   "20271",
   "20258",
   "terminated",
   "dial-in",
   "nps",
   "rras",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "vpn-nps-invalid-client-13",
  "titleHe": "VPN: NPS אירוע 13 (invalid RADIUS client IP) ו-NAT",
  "titleEn": "VPN: NPS event 13 invalid RADIUS client IP (NAT)",
  "category": "VPN",
  "symptom": "ב-NPS מופיע אירוע 13: \"RADIUS message was received from the invalid RADIUS client IP address X\". NPS מתעלם בשקט ולכן אין 6272 או 6273.",
  "commands": [
   {
    "label": "ב-NPS: אירוע 13 ואחרים",
    "text": "Get-WinEvent -FilterHashtable @{LogName='System'; ProviderName='NPS'} -MaxEvents 5 | ft TimeCreated, Id, Message -Wrap"
   },
   {
    "label": "אירועי אישור/דחייה",
    "text": "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=6272,6273} -MaxEvents 3 | fl TimeCreated, Message"
   }
  ],
  "guiSteps": [
   "סיבה נפוצה: NAT. החומה מתרגמת את כתובת שרת ה-VPN לכתובת של החומה, ו-NPS רואה כתובת שלא רשומה כלקוח RADIUS.",
   "פתרון: כלל No-NAT בין ה-DMZ לרשת השרתים (ראה \"Check Point: DMZ, NAT\"). פחות טוב: לרשום את כתובת החומה כלקוח RADIUS.",
   "אחרי תיקון NAT: חיבורי UDP ישנים נשארים בטבלה עם התרגום הישן. להמתין דקה בלי ניסיונות, או לנקות את הטבלה."
  ],
  "ifNotWorking": "",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 09. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. ",
  "tags": [
   "vpn",
   "nps",
   "radius",
   "nat",
   "event 13",
   "invalid client",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "vpn-reason-66-eap",
  "titleHe": "VPN: NPS 6273 Reason Code 66 (EAP במקום MS-CHAPv2)",
  "titleEn": "VPN: NPS 6273 reason 66 (EAP vs MS-CHAPv2)",
  "category": "VPN",
  "symptom": "ב-NPS אירוע 6273 עם Reason Code 66: שיטת האימות שהלקוח ביקש לא מופעלת במדיניות. כשמוסיפים VPN דרך הממשק ובוחרים \"Username and password\", ברירת המחדל נוטה ל-EAP.",
  "commands": [
   {
    "label": "לקוח: יצירה מחדש עם MS-CHAPv2",
    "text": "Remove-VpnConnection -Name \"<CONNECTION-NAME>\" -Force\nAdd-VpnConnection -Name \"<CONNECTION-NAME>\" -ServerAddress \"<VPN-FQDN>\" -TunnelType Sstp -AuthenticationMethod MSChapv2 -EncryptionLevel Required -SplitTunneling $true"
   }
  ],
  "guiSteps": [
   "חלופה בצד השרת: ב-Constraints של מדיניות ה-NPS להוסיף EAP-MSCHAPv2 או PEAP, ולאפשר EAP גם ב-RRAS."
  ],
  "ifNotWorking": "",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 09. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. ",
  "tags": [
   "vpn",
   "nps",
   "6273",
   "reason 66",
   "eap",
   "mschapv2",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "vpn-nps-reason-codes",
  "titleHe": "VPN: קודי Reason נפוצים ב-NPS 6273",
  "titleEn": "VPN: common NPS 6273 reason codes",
  "category": "VPN",
  "symptom": "NPS נותן אירוע 6272 כשהגישה אושרה ו-6273 כשנדחתה, עם Reason Code שמסביר למה.",
  "commands": [
   {
    "label": "אחרון 6272/6273",
    "text": "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=6272,6273} -MaxEvents 3 | fl TimeCreated, Message"
   }
  ],
  "guiSteps": [
   "16 = אימות נכשל (שם משתמש או סיסמה).",
   "21 = אף מדיניות לא תואמת (קבוצה, NAS Port Type, שעות).",
   "48 = לא תואם אף מדיניות רשת.",
   "65 = חסרה הרשאת Dial-in.",
   "66 = שיטת אימות לא מופעלת במדיניות (ראה Reason 66)."
  ],
  "ifNotWorking": "",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 09. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. ",
  "tags": [
   "vpn",
   "nps",
   "reason code",
   "6273",
   "16",
   "21",
   "48",
   "65",
   "66",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "vpn-stale-hosts-dns",
  "titleHe": "VPN: חיבור נכשל בגלל רשומה ישנה ב-hosts או DNS",
  "titleEn": "VPN: stale hosts/DNS entry",
  "category": "VPN",
  "symptom": "החיבור נכשל בלי שגיאה ברורה. הלקוח מנסה כתובת ישנה של שרת ה-VPN.",
  "commands": [
   {
    "label": "מה השם מתורגם אליו",
    "text": "Resolve-DnsName <VPN-FQDN>"
   },
   {
    "label": "רשומה ב-hosts",
    "text": "Select-String '<VPN-FQDN>' C:\\Windows\\System32\\drivers\\etc\\hosts"
   },
   {
    "label": "ניקוי קאש",
    "text": "ipconfig /flushdns"
   }
  ],
  "guiSteps": [
   "למחוק רשומות ישנות מקובץ hosts (כמנהל), ואחר כך flushdns.",
   "רשומת hosts זמנית שהוספת לבדיקה: למחוק אחרי הבדיקה."
  ],
  "ifNotWorking": "",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 09 + 13. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. ",
  "tags": [
   "vpn",
   "hosts",
   "dns",
   "flushdns",
   "stale",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "vpn-restart-dependent-timedout",
  "titleHe": "VPN: Restart-Service \"has dependent services\" ו-TimedOut",
  "titleEn": "VPN: restart-service dependents and TimedOut",
  "category": "VPN",
  "symptom": "שני תסמינים: Restart-Service נכשל בגלל שירותים תלויים, והחיבור מהלקוח לא מגיע בכלל (TimedOut).",
  "commands": [
   {
    "label": "הפעלה מחדש עם Force (עם מקף ב-PowerShell)",
    "text": "Restart-Service <SERVICE> -Force"
   },
   {
    "label": "מהלקוח: האם 443 מגיע",
    "text": "Test-NetConnection <VPN-FQDN> -Port 443"
   },
   {
    "label": "בשרת ה-VPN",
    "text": "netstat -ano | findstr \":443 \""
   }
  ],
  "guiSteps": [
   "אם השירות נתקע ב-Stopping: להרוג את התהליך (ראה RDP תקוע) או להפעיל מחדש את השרת.",
   "TimedOut, בחומה לחפש src:<CLIENT-IP>. Drop בכלל שלפני כלל ה-VPN: לסדר את הכללים. אין שורות בכלל: החבילה לא מגיעה (ניתוב, Port Forward בנתב, כתובת WAN שהשתנתה).",
   "בשרת ה-VPN צריך LISTENING על 443."
  ],
  "ifNotWorking": "",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 09. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. ",
  "tags": [
   "vpn",
   "restart-service",
   "dependent",
   "timedout",
   "443",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "vpn-no-connection-checklist",
  "titleHe": "VPN: רשימת בדיקה כשאין חיבור",
  "titleEn": "VPN: no-connection checklist",
  "category": "VPN",
  "symptom": "סדר בדיקה אחיד מהלקוח ועד ה-AD, כדי לא לנחש.",
  "commands": [
   {
    "label": "1. לקוח ← חומה",
    "text": "Test-NetConnection <VPN-FQDN> -Port 443"
   },
   {
    "label": "3. שרת VPN: מאזין ותעודה",
    "text": "netstat -ano | findstr \":443 \" | findstr LISTENING\nnetsh http show sslcert | findstr /i \"443 Hash\""
   },
   {
    "label": "5. NPS: 6272/6273",
    "text": "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=6272,6273} -MaxEvents 3 | fl TimeCreated, Message"
   }
  ],
  "guiSteps": [
   "1. לקוח ← חומה: Test-NetConnection על 443.",
   "2. לוג חומה: האם הבקשה התקבלה (Accept).",
   "3. שרת VPN: LISTENING על 443 והתעודה מקושרת.",
   "4. שרת VPN ← NPS: 1812 UDP עובר בחומה.",
   "5. NPS: אירוע 6272 או 6273 (ואם אין, אירוע 13).",
   "6. המשתמש: חבר בקבוצה, Dial-in נכון, סיסמה בתוקף.",
   "7. לקוח: סוג אימות תואם למדיניות.",
   "איפה כל שכבה משאירה עקבות: חומה = הלוג, שרת VPN = System (RemoteAccess 20271/20258), NPS = Security (6272/6273) ו-System (NPS), לקוח = קוד השגיאה בהודעה."
  ],
  "ifNotWorking": "",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 09. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. ",
  "tags": [
   "vpn",
   "checklist",
   "troubleshooting",
   "רשימת בדיקה",
   "firewall",
   "nps",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "veeam-install-job",
  "titleHe": "Veeam B&R: התקנה, מאגר ומשימת גיבוי ראשונה",
  "titleEn": "Veeam B&R: install, repository, first job",
  "category": "Backup",
  "symptom": "הקמת גיבוי ל-Windows Servers עם Veeam Backup & Replication: שרת גיבוי, דיסק ייעודי, Protection Group ומשימה.",
  "commands": [
   {
    "label": "אין פקודות ייעודיות, בודקים את דיסק הגיבוי",
    "text": "Get-Volume | ft DriveLetter, FileSystem, AllocationUnitSize, SizeRemaining, Size"
   }
  ],
  "guiSteps": [
   "תכנון: שרת ייעודי מחובר לדומיין, לפחות 8 GB זיכרון (12 GB במעבדה), דיסק גיבוי נפרד מדיסק המערכת, NTFS עם 64K allocation unit.",
   "כלל 3-2-1: 3 עותקים, 2 סוגי מדיה, 1 מחוץ לאתר. גיבוי על אותו שרת הוא לא גיבוי.",
   "התקנה: ISO של Veeam B&R (כ-20 GB) ← Setup ← Backup Server + Console + Catalog ← בסיס נתונים מקומי (PostgreSQL) ← רישיון Free/Trial/Community (לרשום תאריך סיום).",
   "מאגר: Backup Infrastructure ← Backup Repositories ← Add ← Direct attached storage ← Microsoft Windows ← <DRIVE>:\\Backup.",
   "Protection Group: Inventory ← Physical & Cloud Infrastructure ← Add Protection Group ← Active Directory ← בחירת OU של השרתים. Veeam מתקין Agent.",
   "שרתים וירטואליים על Hypervisor: מגבים בדרך כלל ברמת ה-Hypervisor. אם מגבים עם Agent, לוודא שאין חפיפה.",
   "משימה: Home ← Backup Job ← Windows computer ← Server ← Managed by backup server.",
   "Computers: השרתים. Backup Mode: Entire computer. Destination: המאגר ו-Retention (למשל 3 ימים).",
   "Guest Processing: Application-aware processing (VSS), חשוב לבקרי דומיין ולמסדי נתונים. Schedule: לילי. Finish ← Run."
  ],
  "ifNotWorking": "",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 10. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. גיבוי בבקר דומיין חייב VSS לעקביות AD. שחזור בקר דומיין דורש תהליך מיוחד (Authoritative / Non-authoritative) ולא משחזרים בקר ישן בלי לבדוק את מצב השכפול. להבדיל בין VSS ל-Crash-consistent.",
  "tags": [
   "veeam",
   "backup",
   "גיבוי",
   "vss",
   "repository",
   "3-2-1",
   "job",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "veeam-restore-warnings",
  "titleHe": "Veeam: בדיקת שחזור ואזהרות נפוצות",
  "titleEn": "Veeam: restore testing and common warnings",
  "category": "Backup",
  "symptom": "גיבוי שלא נבדק שחזורו הוא לא גיבוי. כולל אזהרות נפוצות כמו Full Repair Needed ובעיית מחיצת EFI.",
  "commands": [
   {
    "label": "מצב הדיסקים במכונה המגובה",
    "text": "Get-Disk; Get-Partition"
   }
  ],
  "guiSteps": [
   "שחזור: Restore ← Entire computer / Files / Application items. לבדוק שחזור קובץ אחד לפחות ולתעד את הזמן.",
   "SureBackup (אם ברישיון): בדיקה אוטומטית של שחזור.",
   "Full Repair Needed או בעיה במחיצת EFI System: לבדוק את הדיסק ואת מחיצת ה-EFI במכונה המגובה ולהריץ שוב.",
   "גיבוי נעצר באמצע (השרת כובה): להריץ שוב ולהקצות חלון גיבוי שבו השרתים זמינים.",
   "אין מקום במאגר: להגדיל דיסק או להקטין Retention."
  ],
  "ifNotWorking": "",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 10. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. לתעד בדיקת שחזור: תאריך, מה שוחזר, כמה זמן.",
  "tags": [
   "veeam",
   "restore",
   "שחזור",
   "surebackup",
   "efi",
   "warnings",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "cp-install-interfaces",
  "titleHe": "Check Point R81.20: התקנה, ממשקים ו-SmartConsole",
  "titleEn": "Check Point R81.20: install, interfaces, SmartConsole",
  "category": "Firewall",
  "symptom": "התקנת חומת אש Check Point (Gaia R81.20), הגדרת ממשקים וחיבור ראשון מ-SmartConsole.",
  "commands": [
   {
    "label": "clish: כל הממשקים",
    "text": "show interfaces all"
   },
   {
    "label": "clish: ממשק בודד",
    "text": "show interface <ETH>"
   },
   {
    "label": "clish: ניתוב",
    "text": "show route"
   },
   {
    "label": "clish: בדיקת חיבור",
    "text": "ping <IP>"
   }
  ],
  "guiSteps": [
   "ארכיטקטורה: Standalone (שער וניהול על אותה מכונה) למעבדה או ארגון קטן, ובארגון גדול נפרד. ניהול מ-SmartConsole.",
   "מומלץ ל-VM: 4 vCPU, 8 GB RAM, 100 GB דיסק. רישיון Trial: לרשום תאריך סיום.",
   "ממשקים: eth0 ניהול, eth1 LAN, eth2 WAN (עדיף סטטי), eth3 DMZ. רשת הניהול נפרדת וניגשים אליה רק מתחנת הניהול.",
   "התקנה: אתחול מ-ISO ← Install ← First Time Configuration Wizard (IP, Mask, Gateway) ← שם מארח, DNS, NTP, סיסמת admin ← סוג התקנה ← GUI Clients: רק תחנת הניהול ← סיום ואתחול.",
   "Gaia Portal: https://<FW-MGMT-IP> ← Network Management ← Network Interfaces ← Edit ← IP/Mask ← Enable.",
   "נתיב ברירת מחדל: Network Management ← IPv4 Static Routes ← Add ← Default ← Gateway של הספק. אם ה-WAN מ-DHCP ייתכן שהנתיב לא מותקן: להגדיר ידנית.",
   "SmartConsole: התחברות ל-<FW-MGMT-IP> עם admin ← אישור טביעת האצבע ← Gateways & Servers ← השער ← Network Management ← Get Interfaces ← With Topology.",
   "טופולוגיה: ניהול ו-LAN = This Network (Internal); WAN = Internet (External); DMZ = This Network (Internal) + Interface leads to DMZ. Anti-Spoofing: Prevent.",
   "Publish שומר במסד הניהול. Install Policy דוחף לשער. בלי Install אין שינוי. Stealth rule חוסם גישה ישירה לשער."
  ],
  "ifNotWorking": "",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 11. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. בסביבה וירטואלית כל ממשק ב-Segment או VLAN נפרד, בלי חיבור שעוקף את החומה.",
  "tags": [
   "checkpoint",
   "check point",
   "gaia",
   "smartconsole",
   "firewall",
   "חומת אש",
   "interfaces",
   "topology",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "cp-policy-rules",
  "titleHe": "Check Point: מדיניות כללים מומלצת וסדר",
  "titleEn": "Check Point: recommended rule base and order",
  "category": "Firewall",
  "symptom": "מדיניות גישה שמתירה רק מה שנדרש, עם סדר שמונע חסימות מיותרות ועם Cleanup שנרשם בלוג.",
  "commands": [],
  "guiSteps": [
   "עקרונות: כללים נבדקים מלמעלה למטה והראשון שמתאים קובע; ברירת מחדל חסום; כל כלל חשוב עם Log; Cleanup חוסם הכול עם Log; Publish ואז Install Policy; בודקים מול היעד המקורי (לפני NAT).",
   "1 Mgmt-Access: Host-Mgmt ← השער, https/ssh/CPMI, Accept.",
   "2 Internet-to-VPN: Any ← Host-VPN ו-Host-FW-WAN, https, Accept.",
   "3 Stealth: Any ← השער, Any, Drop.",
   "4 VPN-to-DCs: Host-VPN ← Group-DCs, DNS/Kerberos/LDAP/NTP/SMB/RPC (135 וטווח גבוה)/RADIUS אם NPS שם/ICMP, Accept.",
   "5 Block-Private: Net-LAN ו-Net-DMZ ← Private-Ranges (10/8, 172.16/12, 192.168/16), Drop.",
   "6 VPN-to-Internet: Host-VPN ← Any, http/https, Accept.",
   "7 LAN-to-Internet: Net-LAN ← Any, dns/http/https/ntp/ICMP echo, Accept.",
   "8 Drop-Noise: Any ← Any, NetBIOS/igmp ושירותי רעש, Drop, Track=None.",
   "9 Cleanup: Any ← Any, Any, Drop, Log.",
   "סדר: כלל 2 מעל Stealth (היעד המקורי הוא החומה עצמה). Block-Private מתחת לכללי ה-DMZ הספציפיים ומעל כללי האינטרנט.",
   "שירות מותאם: New ← Service ← TCP/UDP ← שם ופורט. מלכודת: בשדה Protocol לבחור None, אחרת ערך מוגדר מראש (למשל NTP-UDP) נועל את הפורט.",
   "אובייקטים: Host-Mgmt, Net-LAN, Net-DMZ, Host-VPN, Group-DCs, Private-Ranges (Network Group), Host-FW-WAN. מכונה בודדת = Host, רשת עם מסכה = Network."
  ],
  "ifNotWorking": "כלל חדש לא פועל: רק Publish בלי Install Policy. Accept לא תופס: כלל Drop מעליו (לבדוק Access Rule Name בלוג).",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 12. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. לצלם את המדיניות המלאה ולוג עם Access Rule Name. למה Cleanup עם Log: כדי לראות מה נחסם.",
  "tags": [
   "checkpoint",
   "policy",
   "rules",
   "stealth",
   "cleanup",
   "כללים",
   "firewall",
   "rule base",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "cp-read-logs",
  "titleHe": "Check Point: קריאת לוג ואבחון תקלת תקשורת",
  "titleEn": "Check Point: reading logs to diagnose connectivity",
  "category": "Firewall",
  "symptom": "כל תקלת תקשורת עוברת בלוג של החומה. Access Rule Name הוא המפתח לדעת איזה כלל תפס.",
  "commands": [
   {
    "label": "חיפוש ב-Logs & Events: לפי מקור",
    "text": "src:<IP>"
   },
   {
    "label": "מקור ויעד",
    "text": "src:<IP> AND dst:<IP>"
   },
   {
    "label": "לפי שירות (למשל RADIUS)",
    "text": "src:<IP> AND service:1812"
   }
  ],
  "guiSteps": [
   "Logs & Events ← שורת החיפוש.",
   "ירוק = Accept, אדום = Drop. עמודת Access Rule Name = איזה כלל תפס. Service = פורט ופרוטוקול.",
   "לחיצה כפולה פותחת פירוט כולל NAT (XlateSrc = המקור אחרי התרגום).",
   "1) האם יש שורה בכלל? אין שורה = החבילה לא הגיעה לחומה. 2) האם Drop ובאיזה כלל (Stealth, Cleanup)? 3) האם Accept? אז הבעיה מעבר לחומה (שרת, חזרה, NAT).",
   "רעש נפוץ: NetBIOS (UDP 137/138), IGMP, שידורי נתב. אלה שידורים רגילים ולא תקיפה. מנקים בכלל Drop-Noise עם Track=None."
  ],
  "ifNotWorking": "",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 12. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. ",
  "tags": [
   "checkpoint",
   "logs",
   "לוג",
   "access rule name",
   "smartconsole",
   "troubleshooting",
   "firewall",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "cp-dmz-nat-portforward",
  "titleHe": "Check Point: DMZ, NAT ו-Port Forward לשרת VPN",
  "titleEn": "Check Point: DMZ, NAT and port forward to a VPN server",
  "category": "Firewall",
  "symptom": "שרת חשוף (VPN, אתר, דואר) יושב ב-DMZ עם כרטיס יחיד. אם נפרץ, התוקף מגיע רק למה שהחומה מתירה. כולל הכללים, ה-NAT והבדיקות.",
  "commands": [
   {
    "label": "אימות ממשק ה-DMZ ב-clish",
    "text": "show interface <ETH>"
   },
   {
    "label": "מהשרת ב-DMZ: אמור להצליח",
    "text": "Resolve-DnsName <DOMAIN-FQDN>\nTest-NetConnection <DC-IP> -Port 389\nTest-NetConnection 1.1.1.1 -Port 443"
   },
   {
    "label": "מהשרת ב-DMZ: אמור להיכשל (הוכחת בידוד)",
    "text": "Test-NetConnection <TS-SERVER-IP> -Port 3389\nTest-NetConnection <LOCAL-ROUTER-IP> -Port 80"
   },
   {
    "label": "בדיקה מ\"חוץ\": לבדוק 443 לכתובת ה-WAN",
    "text": "Test-NetConnection <WAN-IP> -Port 443"
   },
   {
    "label": "ניקוי טבלת חיבורים (מנתק זמנית גם ניהול)",
    "text": "fw tab -t connections -x -y"
   }
  ],
  "guiSteps": [
   "מבנה: אינטרנט ← <WAN-IP> ← חומה ← ממשק DMZ (<DMZ-GW-IP>) ← <VPN-SERVER> עם כרטיס אחד. כרטיס שני לרשת הפנימית עוקף את החומה ומבטל את הרעיון.",
   "שלב 1: כרטיס רשת חדש לחומה ב-Segment ייעודי. Gaia Portal ← Network Interfaces ← Edit ← Enable ← <DMZ-GW-IP>/Mask. אימות עם show interface.",
   "שלב 2: SmartConsole ← Get Interfaces With Topology ← ממשק DMZ: This Network (Internal), Network defined by the interface IP and Net Mask, סימון Interface leads to DMZ, Anti-Spoofing=Prevent. אובייקטים: Net-DMZ, Host-VPN, Host-FW-WAN.",
   "שלב 3: כללים: Internet-to-VPN (יעד Host-VPN וגם Host-FW-WAN, מעל Stealth), VPN-to-DCs, Block-Private (מתחת לכלל הבקרים), VPN-to-Internet.",
   "שלב 4א: Hide NAT ל-DMZ: באובייקט Net-DMZ ← NAT ← Add Automatic Address Translation rules ← Hide behind the gateway.",
   "שלב 4ב (חובה): No-NAT ידני Net-DMZ ← Net-LAN, Translated = Original, מעל הכללים האוטומטיים. בלי זה השרתים הפנימיים רואים את החומה ולא את שרת ה-VPN: שובר RADIUS, הרשאות לפי כתובת ולוגים.",
   "שלב 4ג: Port Forward: Any ← Host-FW-WAN, https, Translated Destination = Host-VPN.",
   "שלב 5: Publish ואז Install Policy, לחכות ל-Succeeded.",
   "בדיקה מ\"חוץ\" בלי Port Forward: להוסיף ל-hosts (כמנהל) <WAN-IP> <VPN-FQDN> ולמחוק אחרי הבדיקה, ואז Test-NetConnection על 443 ובלוג Internet-to-VPN ב-Accept.",
   "בפרודקשן: Port Forward של 443 בנתב הארגוני אל <WAN-IP>, כתובת WAN סטטית או Reservation, ורשומת DNS ציבורית ל-<VPN-FQDN>."
  ],
  "ifNotWorking": "TimedOut ל-WAN:443 ובלוג Drop ב-Stealth: היעד המקורי הוא החומה, להוסיף Host-FW-WAN ליעד ולהעביר מעל Stealth. NPS event 13: חסר No-NAT. Install Policy הצליח ואין שינוי: בדוק את Access Rule Name ומספר כלל NAT בפירוט הלוג.",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 13. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. עיקרון חשוב: כללי הגישה נבדקים מול היעד המקורי (לפני NAT). כל התקלות כאן נפתרו מקריאת הלוג (Access Rule Name, XlateSrc).",
  "tags": [
   "checkpoint",
   "dmz",
   "nat",
   "port forward",
   "no-nat",
   "hide nat",
   "vpn",
   "firewall",
   "stealth",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "servers-behind-firewall",
  "titleHe": "העברת שרתים לרשת מאחורי חומת אש",
  "titleEn": "Moving servers behind a firewall",
  "category": "Firewall",
  "symptom": "שרתים מרשת שטוחה עוברים לרשת שהחומה שולטת בה: כל תעבורה החוצה עוברת בכללים ונרשמת. כולל כתובת Gateway, forwarder ואימות.",
  "commands": [
   {
    "label": "Gateway חדש לשרת עם כתובת סטטית",
    "text": "Remove-NetRoute -DestinationPrefix 0.0.0.0/0 -Confirm:$false -ErrorAction SilentlyContinue\nNew-NetRoute -InterfaceAlias \"<NIC>\" -DestinationPrefix 0.0.0.0/0 -NextHop <LAN-GW-IP>"
   },
   {
    "label": "Forwarder ב-DNS של הבקר: בדיקה והחלפה",
    "text": "Get-DnsServerForwarder\nRemove-DnsServerForwarder -IPAddress <OLD-FORWARDER> -Force\nAdd-DnsServerForwarder -IPAddress 1.1.1.1"
   },
   {
    "label": "הוכחה שהשרת מאחורי החומה (MAC של כרטיס ה-LAN של החומה)",
    "text": "Get-NetNeighbor -IPAddress <LAN-GW-IP> | ft IPAddress, LinkLayerAddress, State"
   },
   {
    "label": "חיבור ו-DNS",
    "text": "Test-NetConnection 1.1.1.1 -Port 443\nResolve-DnsName google.com"
   },
   {
    "label": "שכפול AD אחרי המעבר",
    "text": "repadmin /replsummary\nrepadmin /syncall /Ade"
   },
   {
    "label": "תחנה עם שני כרטיסים: Gateway לכרטיס אחד בלבד",
    "text": "Get-NetAdapter | ft Name, Status, MacAddress\nRemove-NetRoute -InterfaceAlias \"<SERVERS-NIC>\" -DestinationPrefix 0.0.0.0/0 -Confirm:$false\nGet-NetRoute -DestinationPrefix 0.0.0.0/0 | ft InterfaceAlias, NextHop, RouteMetric"
   }
  ],
  "guiSteps": [
   "לפני: חלון תחזוקה, גישת קונסולה לכל שרת (hypervisor/iLO/iDRAC), תיעוד כתובות נוכחיות, כללי חומה מוכנים (LAN-to-Internet, Block-Private, Hide NAT), כתובת ה-Gateway החדשה, ובקרי דומיין עוברים ביחד.",
   "ביצוע: להעביר את כרטיס הרשת ל-Segment/VLAN של החומה, לקבוע Gateway, DNS נשאר בקרי הדומיין, forwarder לשרת ציבורי ולא לחומה.",
   "בבקר נוסף: forwarder לבקר הראשון או לאותו שרת ציבורי, לא ללולאה.",
   "בלוג החומה: תעבורה עם Access Rule Name=LAN-to-Internet (Accept).",
   "מה רואים בלוג: https/http ל-Microsoft ו-Azure (עדכונים, טלמטריה; בייצור לשקול רשימת יעדים), DNS ל-1.1.1.1 (תקין), NetBIOS/IGMP ב-Cleanup (Drop-Noise), ניסיונות לרשתות פרטיות ב-Block-Private (לבדוק מי ולמה).",
   "גישת ניהול: תחנה ברשת השרתים עם כניסה אליה דרך החומה או VPN (מומלץ), או כלל ייעודי מתחנת הניהול (RDP בלבד, עם Log, לא Any to Any).",
   "תעבורה באותה רשת לא עוברת בחומה ולא תיראה בלוג. כדי שהחומה תשלוט, מפרידים רשתות עם כלל מפורש."
  ],
  "ifNotWorking": "שרת לא רואה את הבקר: כרטיס עדיין ברשת הישנה (Get-NetNeighbor). שגיאת שכפול 1256 זמנית צפויה כשבקרים ברשתות שונות, אחרי שניהם באותה רשת ו-syncall היא נעלמת. 8524 נשארת: ראה הרשומה על 8524. תקשורת פנימית נעלמה: Block-Private חוסם, לאפשר ספציפית לפניו.",
  "notes": "מקור: חבילת הפרקים הכללית, פרק 14. מחליפים <PLACEHOLDERS> בערכי הסביבה שלך. אותה כתובת IP יכולה להתקיים בשתי רשתות שונות, ולכן MAC של ה-Gateway הוא ההוכחה. לצרף לדוח: תרשים לפני/אחרי, רשימת forwarders ולוג ראשוני.",
  "tags": [
   "segmentation",
   "מעבר רשת",
   "firewall",
   "gateway",
   "forwarder",
   "checkpoint",
   "get-netneighbor",
   "הדרכה",
   "general"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-net-info",
  "titleHe": "macOS רשת: כתובת IP, שער, DNS וממשקים",
  "titleEn": "macOS network info: IP, gateway, DNS, interfaces",
  "category": "macOS",
  "symptom": "צריך לדעת מה כתובת ה-Mac, מי ה-Gateway, ואילו שרתי DNS בשימוש. ב-Mac אין ipconfig כמו ב-Windows, והממשק הראשי הוא בדרך כלל en0.",
  "commands": [
   {
    "label": "כתובת IP של Wi-Fi או Ethernet (בדוק en0, en1)",
    "text": "ipconfig getifaddr en0"
   },
   {
    "label": "כל הממשקים ושמות השירותים",
    "text": "networksetup -listallhardwareports"
   },
   {
    "label": "סדר שירותי הרשת",
    "text": "networksetup -listnetworkserviceorder"
   },
   {
    "label": "Gateway וממשק ברירת מחדל",
    "text": "route -n get default"
   },
   {
    "label": "טבלת ניתוב",
    "text": "netstat -rn"
   },
   {
    "label": "שרתי DNS בפועל (כולל per-domain)",
    "text": "scutil --dns | head -40"
   },
   {
    "label": "כל הפרטים של ממשק",
    "text": "ifconfig en0"
   },
   {
    "label": "כתובת MAC",
    "text": "ifconfig en0 | grep ether"
   },
   {
    "label": "הגדרות שירות (למשל Wi-Fi)",
    "text": "networksetup -getinfo \"Wi-Fi\""
   },
   {
    "label": "כתובת ציבורית",
    "text": "curl -s https://ifconfig.me"
   }
  ],
  "guiSteps": [
   "System Settings ← Network ← בחר Wi-Fi או Ethernet ← Details ← TCP/IP ו-DNS.",
   "Option+קליק על סמל ה-Wi-Fi בשורת התפריטים מציג IP, Router, BSSID, ערוץ ומהירות."
  ],
  "ifNotWorking": "אם אין IP (169.254.x.x): אין DHCP. בדוק כבל/Wi-Fi, ואז Details ← TCP/IP ← Renew DHCP Lease.",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "ip",
   "ipconfig",
   "ifconfig",
   "gateway",
   "dns",
   "network",
   "רשת",
   "mac address",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-net-tests",
  "titleHe": "macOS בדיקות רשת: ping, פורט, DNS, traceroute, curl",
  "titleEn": "macOS connectivity tests",
  "category": "macOS",
  "symptom": "אין חיבור, אתר לא נפתח, או שירות פנימי לא נגיש. סדר בדיקה: Gateway ← IP חיצוני ← DNS ← פורט ← אפליקציה.",
  "commands": [
   {
    "label": "ping ל-Gateway (עצור עם Ctrl+C או -c)",
    "text": "ping -c 4 <GATEWAY-IP>"
   },
   {
    "label": "ping לאינטרנט (בלי DNS)",
    "text": "ping -c 4 1.1.1.1"
   },
   {
    "label": "ping עם שם (בודק DNS)",
    "text": "ping -c 4 google.com"
   },
   {
    "label": "בדיקת פורט TCP פתוח",
    "text": "nc -vz <HOST> 443"
   },
   {
    "label": "בדיקת פורט UDP",
    "text": "nc -vzu <HOST> 53"
   },
   {
    "label": "תשובת DNS מול שרת מסוים",
    "text": "dig @<DNS-IP> <HOST>"
   },
   {
    "label": "DNS בסיסי",
    "text": "nslookup <HOST>"
   },
   {
    "label": "רשומת MX / TXT",
    "text": "dig <DOMAIN> MX +short"
   },
   {
    "label": "מסלול לצומת",
    "text": "traceroute -n 8.8.8.8"
   },
   {
    "label": "כותרות HTTP (קוד תשובה)",
    "text": "curl -I https://<HOST>"
   },
   {
    "label": "זמני חיבור (DNS, חיבור, TLS)",
    "text": "curl -o /dev/null -s -w \"dns:%{time_namelookup} connect:%{time_connect} tls:%{time_appconnect} total:%{time_total}\\n\" https://<HOST>"
   },
   {
    "label": "בדיקת תעודה",
    "text": "openssl s_client -connect <HOST>:443 -servername <HOST> </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates"
   },
   {
    "label": "ARP: מי באותה רשת",
    "text": "arp -a"
   },
   {
    "label": "בדיקת איכות רשת מובנית",
    "text": "networkQuality"
   }
  ],
  "guiSteps": [
   "Wireless Diagnostics: Option+קליק על Wi-Fi ← Open Wireless Diagnostics (לוגים וניתוח אות).",
   "Network Utility כבר לא קיים. משתמשים בטרמינל או באפליקציות צד שלישי."
  ],
  "ifNotWorking": "ping IP עובד ושם לא: בעיית DNS (ראה flush DNS). עובד ל-IP ולא לאתר מסוים: חסימה בחומה או פרוקסי.",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "ping",
   "nc",
   "netcat",
   "dig",
   "nslookup",
   "traceroute",
   "curl",
   "openssl",
   "בדיקות רשת",
   "connectivity",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-dns-flush",
  "titleHe": "macOS איפוס DNS cache",
  "titleEn": "macOS flush DNS cache",
  "category": "macOS",
  "symptom": "אתר או שרת מתורגם לכתובת ישנה אחרי שינוי DNS. ב-Mac אין קאש כללי כמו ipconfig /flushdns, אלא איפוס שני רכיבים.",
  "commands": [
   {
    "label": "איפוס (macOS 12 ומעלה)",
    "text": "sudo dscacheutil -flushcache\nsudo killall -HUP mDNSResponder"
   },
   {
    "label": "בדיקה מה Mac מתרגם",
    "text": "dscacheutil -q host -a name <HOST>"
   },
   {
    "label": "רשומת hosts",
    "text": "grep -v \"^#\" /etc/hosts"
   },
   {
    "label": "מי שרתי ה-DNS",
    "text": "scutil --dns | grep nameserver"
   }
  ],
  "guiSteps": [
   "אחרי האיפוס: לנסות שוב. אם עדיין ישן, לבדוק /etc/hosts, VPN או פרוקסי.",
   "דפדפן: Chrome מחזיק קאש משלו (chrome://net-internals/#dns)."
  ],
  "ifNotWorking": "אם הבעיה נשארת: להחליף DNS זמנית (networksetup -setdnsservers \"Wi-Fi\" 1.1.1.1) ולבדוק שוב.",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "dns",
   "flush",
   "cache",
   "mdnsresponder",
   "dscacheutil",
   "איפוס",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-dns-proxy-set",
  "titleHe": "macOS שינוי DNS ופרוקסי מהטרמינל",
  "titleEn": "macOS set DNS and proxy from CLI",
  "category": "macOS",
  "symptom": "צריך להגדיר DNS או פרוקסי בלי ללחוץ בממשק, או לבדוק מה מוגדר.",
  "commands": [
   {
    "label": "DNS נוכחי לשירות",
    "text": "networksetup -getdnsservers \"Wi-Fi\""
   },
   {
    "label": "קביעת DNS",
    "text": "sudo networksetup -setdnsservers \"Wi-Fi\" 1.1.1.1 8.8.8.8"
   },
   {
    "label": "חזרה לברירת מחדל (DHCP)",
    "text": "sudo networksetup -setdnsservers \"Wi-Fi\" Empty"
   },
   {
    "label": "פרוקסי HTTP נוכחי",
    "text": "networksetup -getwebproxy \"Wi-Fi\""
   },
   {
    "label": "קביעת פרוקסי HTTP",
    "text": "sudo networksetup -setwebproxy \"Wi-Fi\" <PROXY-HOST> <PORT>"
   },
   {
    "label": "כיבוי פרוקסי",
    "text": "sudo networksetup -setwebproxystate \"Wi-Fi\" off"
   },
   {
    "label": "PAC/Auto proxy",
    "text": "networksetup -getautoproxyurl \"Wi-Fi\""
   },
   {
    "label": "רשימת שירותים (לשם המדויק)",
    "text": "networksetup -listallnetworkservices"
   }
  ],
  "guiSteps": [
   "System Settings ← Network ← השירות ← Details ← DNS או Proxies."
  ],
  "ifNotWorking": "",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "dns",
   "proxy",
   "פרוקסי",
   "networksetup",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-wifi",
  "titleHe": "macOS Wi-Fi: חיבור, אות, ושכחת רשת",
  "titleEn": "macOS Wi-Fi troubleshooting",
  "category": "macOS",
  "symptom": "Wi-Fi איטי, מתנתק או לא מתחבר. הפקודה airport הוסרה ב-macOS 14.4 ומעלה, ולכן משתמשים ב-wdutil ו-networksetup.",
  "commands": [
   {
    "label": "רשת נוכחית",
    "text": "networksetup -getairportnetwork en0"
   },
   {
    "label": "פרטי Wi-Fi מלאים (RSSI, ערוץ, רעש, BSSID)",
    "text": "sudo wdutil info"
   },
   {
    "label": "כיבוי והפעלה מחדש של Wi-Fi",
    "text": "networksetup -setairportpower en0 off\nnetworksetup -setairportpower en0 on"
   },
   {
    "label": "התחברות לרשת",
    "text": "networksetup -setairportnetwork en0 \"<SSID>\" \"<PASSWORD>\""
   },
   {
    "label": "רשימת רשתות שמורות",
    "text": "networksetup -listpreferredwirelessnetworks en0"
   },
   {
    "label": "שכחת רשת (להתחבר מחדש עם סיסמה חדשה)",
    "text": "sudo networksetup -removepreferredwirelessnetwork en0 \"<SSID>\""
   }
  ],
  "guiSteps": [
   "איכות האות: RSSI טוב מ-(-60), גבולי (-70), חלש (-80). Noise נמוך מ-RSSI בהרבה (SNR מעל 25 טוב).",
   "Option+קליק על Wi-Fi ← Open Wireless Diagnostics: Window ← Scan, Performance.",
   "System Settings ← Wi-Fi ← Details ← Forget This Network, ואז התחברות מחדש.",
   "Private Wi-Fi Address (MAC אקראי): מאפשר חסימה ב-MAC filter. System Settings ← Wi-Fi ← Details ← Private Wi-Fi address ← Off לרשת ארגונית אם צריך.",
   "VPN/MDM Profile שומר Wi-Fi: Details ← אי אפשר למחוק, צריך להסיר מ-Profiles."
  ],
  "ifNotWorking": "אם עדיין לא מתחבר: ראה \"איפוס הגדרות רשת\" ו-Safe Mode.",
  "notes": "ב-Wi-Fi ארגוני (802.1X) המשתמש מקבל אישור תעודה. תעודת RADIUS משתנה: \"Trust\" מחדש. פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "wifi",
   "wi-fi",
   "wdutil",
   "airport",
   "rssi",
   "802.1x",
   "wireless",
   "אלחוטי",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-network-reset",
  "titleHe": "macOS איפוס הגדרות רשת (מוצא אחרון)",
  "titleEn": "macOS reset network configuration",
  "category": "macOS",
  "symptom": "כל הבעיות ברשת נשארות אחרי DNS, Wi-Fi והפעלה מחדש: ממשקים כפולים, סדר שירותים שבור, הגדרות רשת פגומות.",
  "commands": [
   {
    "label": "גיבוי הקבצים לפני מחיקה",
    "text": "sudo mkdir -p ~/netbackup && sudo cp /Library/Preferences/SystemConfiguration/*.plist ~/netbackup/"
   },
   {
    "label": "הקבצים שנמחקים (לפי הדוקומנטציה הנפוצה)",
    "text": "sudo rm /Library/Preferences/SystemConfiguration/com.apple.airport.preferences.plist\nsudo rm /Library/Preferences/SystemConfiguration/com.apple.network.eapolclient.configuration.plist\nsudo rm /Library/Preferences/SystemConfiguration/NetworkInterfaces.plist\nsudo rm /Library/Preferences/SystemConfiguration/preferences.plist"
   },
   {
    "label": "אחרי המחיקה",
    "text": "sudo reboot"
   }
  ],
  "guiSteps": [
   "מוחקים רק אחרי גיבוי. אחרי אתחול המערכת יוצרת הגדרות רשת חדשות, וצריך לחבר מחדש את ה-Wi-Fi ולבדוק VPN/פרוקסי.",
   "חלופה בטוחה יותר: System Settings ← Network ← מחיקת שירות בעייתי ← ויצירתו מחדש (+)."
  ],
  "ifNotWorking": "",
  "notes": "מוצא אחרון. בדוק שאין MDM Profile שמגדיר רשת, שלא יימחק. פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "network reset",
   "איפוס רשת",
   "preferences.plist",
   "networkinterfaces",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-ports-connections",
  "titleHe": "macOS מי מאזין על פורט ואילו חיבורים פתוחים",
  "titleEn": "macOS listening ports and open connections",
  "category": "macOS",
  "symptom": "צריך לדעת איזה תהליך תופס פורט, או למה האפליקציה מתחברת החוצה.",
  "commands": [
   {
    "label": "כל הפורטים המאזינים (TCP)",
    "text": "sudo lsof -iTCP -sTCP:LISTEN -n -P"
   },
   {
    "label": "מי תופס פורט מסוים",
    "text": "sudo lsof -i :<PORT> -n -P"
   },
   {
    "label": "חיבורים פעילים",
    "text": "netstat -an | grep ESTABLISHED"
   },
   {
    "label": "שימוש רשת חי לפי תהליך",
    "text": "nettop -P -L 1"
   },
   {
    "label": "סטטיסטיקה לפי ממשק",
    "text": "netstat -i"
   },
   {
    "label": "Firewall של Mac: מצב",
    "text": "/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate"
   }
  ],
  "guiSteps": [
   "System Settings ← Network ← Firewall.",
   "Activity Monitor ← Network."
  ],
  "ifNotWorking": "",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "port",
   "lsof",
   "netstat",
   "nettop",
   "firewall",
   "listening",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-vpn-cli",
  "titleHe": "macOS VPN: בדיקה והפעלה מהטרמינל",
  "titleEn": "macOS VPN from CLI",
  "category": "macOS",
  "symptom": "VPN לא מתחבר או נתקע, ורוצים לבדוק או להפעיל אותו בלי הממשק.",
  "commands": [
   {
    "label": "רשימת חיבורי VPN",
    "text": "scutil --nc list"
   },
   {
    "label": "מצב חיבור",
    "text": "scutil --nc status \"<VPN-NAME>\""
   },
   {
    "label": "הפעלה",
    "text": "scutil --nc start \"<VPN-NAME>\""
   },
   {
    "label": "כיבוי",
    "text": "scutil --nc stop \"<VPN-NAME>\""
   },
   {
    "label": "אחרי חיבור: האם הניתוב נכון",
    "text": "netstat -rn | head -20"
   },
   {
    "label": "שם VPN: האם מצביע לשרת הנכון",
    "text": "scutil --nc show \"<VPN-NAME>\""
   }
  ],
  "guiSteps": [
   "System Settings ← VPN ← החיבור ← Connect.",
   "ב-macOS יש תמיכה מובנית ב-IKEv2, L2TP/IPsec ו-Cisco IPSec. SSTP אינו נתמך מובנה ודורש אפליקציה של הספק.",
   "VPN של Always-on או Profile מנוהל: מוגדר ב-MDM ולא מוסרים מהממשק."
  ],
  "ifNotWorking": "אחרי חיבור אין גישה לשרתים פנימיים: בדוק DNS פנימי (scutil --dns) וניתוב split-tunnel.",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "vpn",
   "scutil",
   "ikev2",
   "l2tp",
   "tunnel",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-smb-shares",
  "titleHe": "macOS חיבור לשיתוף SMB / שרת קבצים",
  "titleEn": "macOS SMB share connection",
  "category": "macOS",
  "symptom": "צריך להתחבר לתיקייה משותפת של Windows, או שהחיבור נותק או לא נותן גישה.",
  "commands": [
   {
    "label": "פתיחה בחלון Finder",
    "text": "open \"smb://<FILE-SERVER>/<SHARE>\""
   },
   {
    "label": "חיבור מהטרמינל",
    "text": "mkdir -p ~/share && mount_smbfs \"//<DOMAIN>;<USER>@<FILE-SERVER>/<SHARE>\" ~/share"
   },
   {
    "label": "ניתוק",
    "text": "umount ~/share"
   },
   {
    "label": "שיתופים פעילים",
    "text": "smbutil statshares -a"
   },
   {
    "label": "מה מוצמד כרגע",
    "text": "mount | grep smbfs"
   },
   {
    "label": "בדיקת פורט SMB",
    "text": "nc -vz <FILE-SERVER> 445"
   },
   {
    "label": "שרת בדומיין: בדיקת Kerberos",
    "text": "klist"
   }
  ],
  "guiSteps": [
   "Finder ← Go ← Connect to Server (Cmd+K) ← smb://server/share.",
   "לשמור סיסמה: סמן Remember this password in my keychain.",
   "ניתוק קבוע: Finder ← סמל ה-Eject ליד השיתוף בסרגל הצד.",
   "להפעלה בכניסה: System Settings ← General ← Login Items ← הוספת השיתוף."
  ],
  "ifNotWorking": "גישה נדחית: ודא שם משתמש בפורמט DOMAIN;user או user@domain.com, ושההרשאות (Share ו-NTFS) תקינות. חיבור איטי: בדוק קוד חתימה ב-SMB ו-VPN.",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "smb",
   "share",
   "file server",
   "שיתוף",
   "mount_smbfs",
   "finder",
   "windows",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-ad-kerberos",
  "titleHe": "macOS ו-AD: Kerberos, kinit ו-SSO",
  "titleEn": "macOS with Active Directory: Kerberos and SSO",
  "category": "macOS",
  "symptom": "Mac בארגון עם AD מבקש סיסמה שוב ושוב, או שאין SSO לשרתי קבצים ולאתרים פנימיים.",
  "commands": [
   {
    "label": "כרטיסי Kerberos פעילים",
    "text": "klist"
   },
   {
    "label": "קבלת כרטיס",
    "text": "kinit <USER>@<DOMAIN.LOCAL>"
   },
   {
    "label": "מחיקת כרטיסים (לבדיקה מחדש)",
    "text": "kdestroy -a"
   },
   {
    "label": "בדיקת AD Bind ישן (אם קיים)",
    "text": "dsconfigad -show"
   },
   {
    "label": "בדיקת חיפוש משתמש דרך AD",
    "text": "dscl \"/Active Directory/<DOMAIN>/All Domains\" -read /Users/<USER>"
   },
   {
    "label": "Kerberos SSO Extension (MDM)",
    "text": "app-sso -l"
   },
   {
    "label": "סטטוס Platform SSO / Entra",
    "text": "app-sso platform -s"
   }
  ],
  "guiSteps": [
   "הצטרפות ישירה ל-AD (Directory Utility) מתיישנת. הדרך המודרנית: Kerberos SSO Extension או Platform SSO דרך MDM (Jamf, Intune, Kandji).",
   "אם הסיסמה ב-AD השתנתה והמק לא מסונכרן: התנתק והתחבר, או שנה סיסמה ב-Mac כדי שה-Keychain יתעדכן.",
   "Date/Time חייבים להיות מסונכרנים (פער מעל 5 דקות שובר Kerberos)."
  ],
  "ifNotWorking": "kinit נכשל: בדוק DNS של הדומיין (dig _kerberos._tcp.<DOMAIN>), זמן, ושם ה-Realm באותיות גדולות.",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "ad",
   "active directory",
   "kerberos",
   "kinit",
   "klist",
   "sso",
   "dsconfigad",
   "entra",
   "platform sso",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-accounts-passwords",
  "titleHe": "macOS חשבונות וסיסמאות: איפוס, מנהל ו-Secure Token",
  "titleEn": "macOS accounts, password reset, Secure Token",
  "category": "macOS",
  "symptom": "משתמש שכח סיסמה, צריך להוסיף מנהל, או שמשתמש לא מצליח לפתוח FileVault.",
  "commands": [
   {
    "label": "רשימת משתמשים",
    "text": "dscl . -list /Users | grep -v \"^_\""
   },
   {
    "label": "משתמש מנהל? (admin)",
    "text": "dscl . -read /Groups/admin GroupMembership"
   },
   {
    "label": "איפוס סיסמה (בלי למחוק)",
    "text": "sudo sysadminctl -resetPasswordFor <USER> -newPassword <NEW> -adminUser <ADMIN> -adminPassword -"
   },
   {
    "label": "הוספת מנהל",
    "text": "sudo dseditgroup -o edit -a <USER> -t user admin"
   },
   {
    "label": "הסרת מנהל",
    "text": "sudo dseditgroup -o edit -d <USER> -t user admin"
   },
   {
    "label": "Secure Token של משתמש",
    "text": "sysadminctl -secureTokenStatus <USER>"
   },
   {
    "label": "משתמשי FileVault (APFS)",
    "text": "diskutil apfs listUsers /"
   },
   {
    "label": "נעילת משתמש",
    "text": "sudo pwpolicy -u <USER> -getpolicy"
   }
  ],
  "guiSteps": [
   "System Settings ← Users & Groups ← המשתמש ← Reset Password (דורש מנהל).",
   "כשל כניסה: לחצו על סימן השאלה/Forgot password במסך הכניסה, ואפשר להשתמש ב-Apple ID או במפתח FileVault.",
   "Recovery: Options ← Utilities ← Terminal ← resetpassword (אפשרות לאפס דרך Apple ID).",
   "למשתמש חדש במחשב עם FileVault: רק משתמש עם Secure Token יכול לפתוח את הדיסק. מנהל ראשון מקבל אוטומטית, אחרים צריכים הענקה."
  ],
  "ifNotWorking": "סיסמת כניסה ו-Keychain לא מסונכרנות אחרי איפוס: ה-Keychain עדיין עם הסיסמה הישנה. ראה \"Keychain\".",
  "notes": "איפוס דרך Recovery או sysadminctl לא מעדכן את ה-Login Keychain. המשתמש יקבל בקשות סיסמה ל-Keychain. פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "password",
   "סיסמה",
   "sysadminctl",
   "secure token",
   "admin",
   "user",
   "dscl",
   "reset",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-filevault",
  "titleHe": "macOS FileVault: סטטוס ומפתח שחזור",
  "titleEn": "macOS FileVault status and recovery key",
  "category": "macOS",
  "symptom": "צריך לבדוק שהדיסק מוצפן (דרישת ארגון/ISO), או שאבד מפתח שחזור.",
  "commands": [
   {
    "label": "סטטוס",
    "text": "fdesetup status"
   },
   {
    "label": "מי יכול לפתוח את הדיסק",
    "text": "sudo fdesetup list"
   },
   {
    "label": "הפעלה (עם מפתח שחזור אישי)",
    "text": "sudo fdesetup enable"
   },
   {
    "label": "מפתח שחזור חדש",
    "text": "sudo fdesetup changerecovery -personal"
   },
   {
    "label": "בדיקת מפתח",
    "text": "sudo fdesetup validaterecovery"
   },
   {
    "label": "התקדמות הצפנה",
    "text": "diskutil apfs list | grep -i \"FileVault\""
   }
  ],
  "guiSteps": [
   "System Settings ← Privacy & Security ← FileVault.",
   "ארגון עם MDM: המפתח נשמר ב-MDM (Jamf, Intune). למצוא שם ולא ב-Apple ID.",
   "שמור את מפתח השחזור מחוץ ל-Mac. בלי מפתח ובלי סיסמה אין שחזור."
  ],
  "ifNotWorking": "",
  "notes": "לא פותחים את הדיסק בלי סיסמה או מפתח שחזור: זה הרעיון של ההצפנה. פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "filevault",
   "encryption",
   "הצפנה",
   "recovery key",
   "fdesetup",
   "bitlocker",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-keychain",
  "titleHe": "macOS Keychain: בקשות סיסמה חוזרות ואיפוס",
  "titleEn": "macOS Keychain prompts and reset",
  "category": "macOS",
  "symptom": "המק מבקש שוב ושוב סיסמת Keychain אחרי שינוי סיסמה, או שאפליקציות (Outlook, Wi-Fi) לא זוכרות כניסה.",
  "commands": [
   {
    "label": "רשימת Keychains",
    "text": "security list-keychains"
   },
   {
    "label": "ברירת מחדל",
    "text": "security default-keychain"
   },
   {
    "label": "נעילה/פתיחה",
    "text": "security unlock-keychain ~/Library/Keychains/login.keychain-db"
   },
   {
    "label": "חיפוש רשומה",
    "text": "security find-generic-password -s \"<SERVICE>\""
   },
   {
    "label": "מחיקת רשומה פגומה",
    "text": "security delete-generic-password -s \"<SERVICE>\""
   }
  ],
  "guiSteps": [
   "Keychain Access ← login ← קליק ימני ← Change Password for Keychain \"login\" ← הסיסמה הישנה והחדשה (אחרי איפוס סיסמה מ-Recovery).",
   "Keychain Access ← Settings ← Reset My Default Keychains (מוחק את כל הסיסמאות השמורות!). רק כשהסיסמה הישנה לא ידועה.",
   "אפליקציית Microsoft Office: למחוק רשומות com.microsoft.* / adal / Microsoft Office Identities ב-Keychain, ולהתחבר מחדש."
  ],
  "ifNotWorking": "",
  "notes": "גיבוי: Time Machine או iCloud Keychain לפני איפוס. פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "keychain",
   "password prompt",
   "security",
   "סיסמה",
   "login keychain",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-sysinfo",
  "titleHe": "macOS מידע מערכת: גרסה, חומרה, סידורי, דיסק",
  "titleEn": "macOS system info",
  "category": "macOS",
  "symptom": "פתיחת קריאה או מלאי: צריך גרסת מערכת, דגם, Serial, זיכרון ומעבד.",
  "commands": [
   {
    "label": "גרסת macOS ו-Build",
    "text": "sw_vers"
   },
   {
    "label": "דגם, מעבד, זיכרון, Serial",
    "text": "system_profiler SPHardwareDataType"
   },
   {
    "label": "Serial בלבד",
    "text": "system_profiler SPHardwareDataType | awk '/Serial/ {print $4}'"
   },
   {
    "label": "שם מחשב",
    "text": "scutil --get ComputerName; scutil --get LocalHostName"
   },
   {
    "label": "ארכיטקטורה (arm64 או x86_64)",
    "text": "uname -m"
   },
   {
    "label": "שם המעבד",
    "text": "sysctl -n machdep.cpu.brand_string"
   },
   {
    "label": "זמן פעולה",
    "text": "uptime"
   },
   {
    "label": "דיסקים",
    "text": "diskutil list"
   },
   {
    "label": "מקום פנוי",
    "text": "df -h /"
   },
   {
    "label": "כל הדוח",
    "text": "system_profiler -detailLevel mini > ~/Desktop/sysinfo.txt"
   }
  ],
  "guiSteps": [
   "Apple menu ← About This Mac ← More Info.",
   "Option+Apple menu ← System Information."
  ],
  "ifNotWorking": "",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "sysinfo",
   "serial",
   "sw_vers",
   "system_profiler",
   "hardware",
   "מלאי",
   "inventory",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-disk-space",
  "titleHe": "macOS הדיסק מלא: מציאת תפוסה וניקוי",
  "titleEn": "macOS disk full: find and free space",
  "category": "macOS",
  "symptom": "המק מודיע \"disk almost full\", עדכון נכשל או איטי. לעיתים Time Machine Local Snapshots תופסים עשרות GB.",
  "commands": [
   {
    "label": "מקום פנוי",
    "text": "df -h /"
   },
   {
    "label": "תיקיות גדולות בבית",
    "text": "du -sh ~/* 2>/dev/null | sort -rh | head -15"
   },
   {
    "label": "תיקיית Library",
    "text": "du -sh ~/Library/* 2>/dev/null | sort -rh | head -10"
   },
   {
    "label": "תמונות ממצב Time Machine",
    "text": "tmutil listlocalsnapshots /"
   },
   {
    "label": "מחיקת תמונת מצב",
    "text": "sudo tmutil deletelocalsnapshots <DATE>"
   },
   {
    "label": "פירוט נפחי APFS",
    "text": "diskutil apfs list"
   },
   {
    "label": "קבצים מעל 1GB",
    "text": "sudo find / -xdev -type f -size +1G -exec ls -lh {} \\; 2>/dev/null"
   }
  ],
  "guiSteps": [
   "System Settings ← General ← Storage ← המלצות ו-Remove.",
   "Empty Trash, ניקוי Downloads, ונקודות שטח \"System Data\": לוגים, קאש, snapshots.",
   "אפליקציות Xcode / Docker / Parallels לרוב הגדולות: ~/Library/Developer, ~/Library/Containers."
  ],
  "ifNotWorking": "",
  "notes": "\"System Data\" ענק: בדוק tmutil listlocalsnapshots ו-~/Library/Caches. אל תמחק ידנית ב-/System או /private/var. פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "disk",
   "storage",
   "דיסק מלא",
   "space",
   "tmutil",
   "snapshots",
   "du",
   "df",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-disk-repair",
  "titleHe": "macOS תיקון דיסק: First Aid ו-diskutil",
  "titleEn": "macOS disk repair: First Aid and diskutil",
  "category": "macOS",
  "symptom": "המק קופא, שגיאות בקבצים, או לא עולה. נבדקות מערכת קבצים APFS ומחיצות.",
  "commands": [
   {
    "label": "אימות volume",
    "text": "diskutil verifyVolume /"
   },
   {
    "label": "תיקון volume",
    "text": "diskutil repairVolume /"
   },
   {
    "label": "אימות דיסק",
    "text": "diskutil verifyDisk disk0"
   },
   {
    "label": "מצב SMART (לדיסקים שתומכים)",
    "text": "diskutil info disk0 | grep -i smart"
   },
   {
    "label": "רשימת מחיצות",
    "text": "diskutil list"
   },
   {
    "label": "Mount ידני",
    "text": "diskutil mount disk3s1"
   }
  ],
  "guiSteps": [
   "Disk Utility ← בחירת Volume ← First Aid ← Run (קודם ה-Data, אחר כך Macintosh HD, ובסוף הדיסק הפיזי).",
   "אם המק לא עולה: Recovery ← Disk Utility ← First Aid.",
   "סימנים לדיסק פיזי גוסס: First Aid נכשל, קבצים נעלמים, איטיות קיצונית. לגבות מיד."
  ],
  "ifNotWorking": "",
  "notes": "Apple Silicon: אין fsck ב-Single user. תיקונים רק מ-Recovery. פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "disk",
   "first aid",
   "diskutil",
   "apfs",
   "repair",
   "smart",
   "תיקון דיסק",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-slow-performance",
  "titleHe": "macOS איטי, מאוורר רועש, מעבד גבוה",
  "titleEn": "macOS slow, loud fan, high CPU",
  "category": "macOS",
  "symptom": "המק איטי, מתחמם או שהמאוורר רועש. לרוב תהליך שרץ ב-CPU גבוה, זיכרון מלא, Spotlight שמאנדקס, או Login Items.",
  "commands": [
   {
    "label": "תהליכים לפי CPU (תמונת מצב)",
    "text": "top -o cpu -l 1 -n 10 | head -25"
   },
   {
    "label": "לפי זיכרון",
    "text": "top -o mem -l 1 -n 10 | head -25"
   },
   {
    "label": "לחץ זיכרון",
    "text": "memory_pressure"
   },
   {
    "label": "Swap בשימוש",
    "text": "sysctl vm.swapusage"
   },
   {
    "label": "Load Average",
    "text": "uptime"
   },
   {
    "label": "תהליכי אינדוקס",
    "text": "ps aux | grep -E \"mds|mdworker|photoanalysisd\" | grep -v grep"
   },
   {
    "label": "התפלגות עומס בדקה",
    "text": "sudo powermetrics --samplers cpu_power -i 1000 -n 1"
   }
  ],
  "guiSteps": [
   "Activity Monitor: CPU, Memory (Memory Pressure ירוק/צהוב/אדום), Energy, Disk.",
   "System Settings ← General ← Login Items & Extensions: להסיר מיותרים.",
   "ראה אם עדכון macOS או Time Machine או Photos רצים ברקע.",
   "מכשיר ישן (Intel) מתחמם: בדוק אבק, חומר תרמי, ו-Chrome עם הרבה לשוניות.",
   "סגירה והפעלה מחדש: אם לא הופעל מעל 2-3 שבועות."
  ],
  "ifNotWorking": "אם הלחץ זיכרון אדום תמיד: חסר RAM. אם דיסק מלא: ראה \"הדיסק מלא\".",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "slow",
   "איטי",
   "cpu",
   "memory",
   "fan",
   "top",
   "activity monitor",
   "performance",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-app-frozen",
  "titleHe": "macOS אפליקציה קפואה: Force Quit והריגת תהליך",
  "titleEn": "macOS frozen app: force quit",
  "category": "macOS",
  "symptom": "אפליקציה לא מגיבה (כדור מסתובב) או לא נסגרת.",
  "commands": [
   {
    "label": "מציאת PID",
    "text": "pgrep -il \"<APP>\""
   },
   {
    "label": "סגירה עדינה",
    "text": "killall \"<APP>\""
   },
   {
    "label": "הריגה כפויה",
    "text": "killall -9 \"<APP>\""
   },
   {
    "label": "הריגה לפי PID",
    "text": "kill -9 <PID>"
   },
   {
    "label": "הפעלה מחדש של Finder",
    "text": "killall Finder"
   },
   {
    "label": "הפעלה מחדש של Dock",
    "text": "killall Dock"
   },
   {
    "label": "הפעלה מחדש של שורת התפריטים",
    "text": "killall SystemUIServer"
   },
   {
    "label": "ריענון ממשק גרפי (הכי הרבה אפליקציות)",
    "text": "sudo killall -HUP WindowServer"
   }
  ],
  "guiSteps": [
   "Cmd+Option+Esc ← בחירת האפליקציה ← Force Quit.",
   "Apple menu ← Force Quit.",
   "Activity Monitor ← התהליך ← X ← Force Quit.",
   "אחרי Force Quit: לפתוח מחדש. אם קורס שוב, למחוק את קובצי ה-Preferences שלה (~/Library/Preferences/<bundle>.plist)."
  ],
  "ifNotWorking": "WindowServer HUP מנתק את כל המשתמש (כניסה מחדש). רק כשהמסך קפוא.",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "force quit",
   "frozen",
   "killall",
   "kill",
   "קפוא",
   "not responding",
   "dock",
   "finder",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-crash-logs",
  "titleHe": "macOS לוגים וקריסות: log, Console ו-sysdiagnose",
  "titleEn": "macOS logs and crash reports",
  "category": "macOS",
  "symptom": "צריך להבין למה אפליקציה קורסת או למה המק קפא/התאתחל (Kernel Panic).",
  "commands": [
   {
    "label": "לוג חי",
    "text": "log stream --level info"
   },
   {
    "label": "לוג של תהליך",
    "text": "log stream --predicate 'process == \"<APP>\"'"
   },
   {
    "label": "שעה אחרונה, שגיאות",
    "text": "log show --last 1h --predicate 'eventMessage CONTAINS[c] \"error\"' --style compact | tail -50"
   },
   {
    "label": "לוג של כשל התחברות/אימות",
    "text": "log show --last 30m --predicate 'process == \"opendirectoryd\"' --style compact | tail -50"
   },
   {
    "label": "דוחות קריסה",
    "text": "ls -lt ~/Library/Logs/DiagnosticReports | head"
   },
   {
    "label": "דוחות מערכת (Kernel Panic)",
    "text": "ls -lt /Library/Logs/DiagnosticReports | head"
   },
   {
    "label": "אסוף את הכל לצורך תמיכה",
    "text": "sudo sysdiagnose"
   }
  ],
  "guiSteps": [
   "Console.app: בחר את המק ← חפש לפי תהליך, או Crash Reports.",
   "Kernel Panic: \"Your computer restarted because of a problem\". לבדוק את הדוח, לשלול הרחבות/חומרה חיצונית, ולעדכן.",
   "ב-macOS החדש אין /var/log/system.log. משתמשים ב-log."
  ],
  "ifNotWorking": "",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "logs",
   "log show",
   "console",
   "crash",
   "kernel panic",
   "sysdiagnose",
   "diagnosticreports",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-spotlight",
  "titleHe": "macOS Spotlight לא מוצא או איטי: אינדוקס מחדש",
  "titleEn": "macOS Spotlight reindex",
  "category": "macOS",
  "symptom": "חיפוש לא מוצא קבצים, Mail/Outlook לא מחפש, או mds_stores צורך CPU.",
  "commands": [
   {
    "label": "מצב אינדוקס",
    "text": "mdutil -s /"
   },
   {
    "label": "אינדוקס מחדש (מחיקת ה-Index)",
    "text": "sudo mdutil -E /"
   },
   {
    "label": "כיבוי והפעלה",
    "text": "sudo mdutil -i off /\nsudo mdutil -i on /"
   },
   {
    "label": "בדיקת חיפוש",
    "text": "mdfind -name \"<FILE>\""
   }
  ],
  "guiSteps": [
   "System Settings ← Siri & Spotlight ← Search Results: לוודא שהקטגוריות מופעלות.",
   "Spotlight Privacy: להסיר ולהוסיף מחדש את הדיסק/תיקייה.",
   "אינדוקס מחדש לוקח שעות, וה-Mac יהיה איטי בזמן הזה."
  ],
  "ifNotWorking": "",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "spotlight",
   "mdutil",
   "mdfind",
   "search",
   "index",
   "חיפוש",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-gatekeeper-quarantine",
  "titleHe": "macOS \"לא ניתן לפתוח\" - Gatekeeper ואפליקציות חסומות",
  "titleEn": "macOS Gatekeeper and blocked apps",
  "category": "macOS",
  "symptom": "\"App can't be opened because Apple cannot check it for malicious software\" או \"damaged and can't be opened\". לפעמים אפליקציה נחסמת אחרי הורדה.",
  "commands": [
   {
    "label": "מצב Gatekeeper",
    "text": "spctl --status"
   },
   {
    "label": "בדיקה אם האפליקציה חתומה/מאושרת",
    "text": "spctl --assess --verbose /Applications/<APP>.app"
   },
   {
    "label": "חתימה",
    "text": "codesign -dv --verbose=4 /Applications/<APP>.app"
   },
   {
    "label": "רק אחרי שמוודאים שהמקור בטוח: הסרת Quarantine",
    "text": "xattr -d com.apple.quarantine /Applications/<APP>.app"
   },
   {
    "label": "רשימת תכונות מורחבות",
    "text": "xattr -l /Applications/<APP>.app"
   }
  ],
  "guiSteps": [
   "System Settings ← Privacy & Security ← למטה: \"<APP> was blocked\" ← Open Anyway.",
   "Finder ← קליק ימני על האפליקציה ← Open ← Open (עוקף פעם אחת).",
   "Mac ארגוני: אפליקציות מותרות דרך MDM. לא עוקפים Gatekeeper בלי אישור IT."
  ],
  "ifNotWorking": "חסימה אחרי שהורדה מהאתר הרשמי: הורד מחדש. אם \"damaged\": הורדה פגומה או חתימה פגה.",
  "notes": "אל תריץ xattr -d על תוכנה לא ידועה. זה בדיוק הבדיקה שמגנה. פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "gatekeeper",
   "quarantine",
   "xattr",
   "spctl",
   "blocked app",
   "חסום",
   "unidentified developer",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-privacy-permissions",
  "titleHe": "macOS הרשאות פרטיות (TCC): מצלמה, מיקרופון, Full Disk Access",
  "titleEn": "macOS privacy permissions (TCC)",
  "category": "macOS",
  "symptom": "אפליקציה (Zoom, Teams, Terminal, סקריפט) לא מקבלת מצלמה, מיקרופון, שיתוף מסך, או גישה לקבצים.",
  "commands": [
   {
    "label": "איפוס הרשאה לכל האפליקציות (מצלמה)",
    "text": "tccutil reset Camera"
   },
   {
    "label": "איפוס מיקרופון",
    "text": "tccutil reset Microphone"
   },
   {
    "label": "איפוס שיתוף מסך",
    "text": "tccutil reset ScreenCapture"
   },
   {
    "label": "איפוס לאפליקציה אחת",
    "text": "tccutil reset All <BUNDLE-ID>"
   },
   {
    "label": "מציאת Bundle ID",
    "text": "osascript -e 'id of app \"<APP>\"'"
   },
   {
    "label": "איפוס Full Disk Access",
    "text": "tccutil reset SystemPolicyAllFiles"
   }
  ],
  "guiSteps": [
   "System Settings ← Privacy & Security ← Camera / Microphone / Screen & System Audio Recording / Full Disk Access / Accessibility.",
   "להפעיל את האפליקציה ברשימה, וכשמבקש, לסגור ולפתוח אותה מחדש.",
   "האפליקציה לא ברשימה: להפעיל אותה כדי שתבקש הרשאה (ואז תופיע), או tccutil reset ולנסות שוב.",
   "ב-Mac מנוהל: הרשאות מסוימות מוענקות מראש ב-MDM (PPPC profile)."
  ],
  "ifNotWorking": "",
  "notes": "שינוי ב-Full Disk Access וב-Screen Recording דורש לפעמים סגירה והפעלה מחדש של האפליקציה. פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "tcc",
   "permissions",
   "privacy",
   "camera",
   "microphone",
   "screen recording",
   "full disk access",
   "tccutil",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-updates",
  "titleHe": "macOS עדכונים: softwareupdate ו-Rosetta",
  "titleEn": "macOS updates: softwareupdate and Rosetta",
  "category": "macOS",
  "symptom": "עדכון macOS נתקע, לא מציע, או שצריך להתקין Rosetta/עדכוני אבטחה מהטרמינל.",
  "commands": [
   {
    "label": "עדכונים זמינים",
    "text": "softwareupdate --list"
   },
   {
    "label": "התקנת הכל",
    "text": "sudo softwareupdate --install --all"
   },
   {
    "label": "התקנת עדכון מסוים",
    "text": "sudo softwareupdate --install \"<LABEL>\""
   },
   {
    "label": "Rosetta 2 (Apple Silicon, לאפליקציות Intel)",
    "text": "sudo softwareupdate --install-rosetta --agree-to-license"
   },
   {
    "label": "רשימת התקנות",
    "text": "softwareupdate --history"
   },
   {
    "label": "מקום פנוי לעדכון",
    "text": "df -h /"
   }
  ],
  "guiSteps": [
   "System Settings ← General ← Software Update.",
   "עדכון נתקע: להמתין, לבדוק מקום פנוי, להפעיל מחדש ולנסות שוב. אם נשאר: Safe Mode או Recovery ← Reinstall macOS (לא מוחק נתונים).",
   "Mac מנוהל: ה-MDM עשוי לדחות עדכונים או לחייב מועד. פנה למנהל."
  ],
  "ifNotWorking": "עדכון נכשל \"Not enough space\": ראה \"הדיסק מלא\". דורש לפחות 20-30GB בדרך כלל.",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "update",
   "עדכון",
   "softwareupdate",
   "rosetta",
   "ventura",
   "sonoma",
   "sequoia",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-printers",
  "titleHe": "macOS מדפסות: CUPS, תור הדפסה ואיפוס",
  "titleEn": "macOS printers and CUPS",
  "category": "macOS",
  "symptom": "המדפסת לא מדפיסה, תור תקוע, או המדפסת מוצגת Offline.",
  "commands": [
   {
    "label": "מדפסות ומצב",
    "text": "lpstat -p -d"
   },
   {
    "label": "כתובות (URI)",
    "text": "lpstat -v"
   },
   {
    "label": "תור הדפסה",
    "text": "lpq"
   },
   {
    "label": "ביטול כל העבודות",
    "text": "cancel -a"
   },
   {
    "label": "הפעלה מחדש של CUPS",
    "text": "sudo launchctl kickstart -k system/org.cups.cupsd"
   },
   {
    "label": "הפעלת ממשק ניהול (כבה בסוף)",
    "text": "cupsctl WebInterface=yes"
   },
   {
    "label": "הסרת מדפסת",
    "text": "sudo lpadmin -x \"<PRINTER>\""
   },
   {
    "label": "בדיקת פורט מדפסת IP",
    "text": "nc -vz <PRINTER-IP> 9100"
   }
  ],
  "guiSteps": [
   "System Settings ← Printers & Scanners ← קליק ימני על הרשימה ← Reset printing system (מוחק את כל המדפסות).",
   "להוסיף מדפסת: + ← IP ← פרוטוקול (AirPrint, IPP, LPD, HP JetDirect) ← Use.",
   "ממשק ב-http://localhost:631 (אחרי cupsctl WebInterface=yes).",
   "מדפסת ארגונית: להתקין דרייבר רשמי של היצרן ולא \"Generic PostScript\"."
  ],
  "ifNotWorking": "מדפסת Offline: ping, 9100/631, ושה-Mac באותה רשת. אחרי החלפת IP: למחוק ולהוסיף מחדש.",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "printer",
   "מדפסת",
   "cups",
   "lpstat",
   "print queue",
   "airprint",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-bluetooth-audio",
  "titleHe": "macOS Bluetooth ושמע: איפוס רכיבים",
  "titleEn": "macOS Bluetooth and audio reset",
  "category": "macOS",
  "symptom": "אוזניות לא מתחברות, אין קול, מיקרופון לא עובד, עכבר Bluetooth מתנתק.",
  "commands": [
   {
    "label": "הפעלה מחדש של Bluetooth",
    "text": "sudo pkill bluetoothd"
   },
   {
    "label": "הפעלה מחדש של שמע",
    "text": "sudo killall coreaudiod"
   },
   {
    "label": "התקני Bluetooth",
    "text": "system_profiler SPBluetoothDataType"
   },
   {
    "label": "התקני שמע",
    "text": "system_profiler SPAudioDataType"
   },
   {
    "label": "עוצמת קול",
    "text": "osascript -e \"output volume of (get volume settings)\""
   },
   {
    "label": "הגדרות קול",
    "text": "defaults read com.apple.sound.beep.volume"
   }
  ],
  "guiSteps": [
   "System Settings ← Bluetooth ← קליק על ההתקן ← Forget / Remove, ואז Pair מחדש.",
   "System Settings ← Sound ← Input/Output: לבחור את ההתקן הנכון.",
   "Option+קליק על סמל Bluetooth/Sound בשורת התפריטים מציג התקני שמע ופרטים.",
   "Zoom/Teams: להגדיר מיקרופון בתוך האפליקציה ולבדוק הרשאות מיקרופון."
  ],
  "ifNotWorking": "אחרי עדכון macOS ו-Bluetooth שבור: להפעיל מחדש, ואם נשאר, Safe Mode. Intel: איפוס NVRAM.",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "bluetooth",
   "audio",
   "sound",
   "coreaudiod",
   "headphones",
   "microphone",
   "שמע",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-boot-recovery",
  "titleHe": "macOS אתחול, Safe Mode, Recovery ואיפוס NVRAM",
  "titleEn": "macOS boot, Safe Mode, Recovery, NVRAM",
  "category": "macOS",
  "symptom": "המק לא עולה, תקוע על לוגו, או צריך להיכנס ל-Recovery/Safe Mode כדי לתקן. צריך לדעת איך כל דגם נכנס.",
  "commands": [
   {
    "label": "מצב אתחול",
    "text": "nvram -p | head"
   },
   {
    "label": "הפעלה מחדש",
    "text": "sudo shutdown -r now"
   }
  ],
  "guiSteps": [
   "Apple Silicon (M1 ומעלה): לכבות, ללחוץ ולהחזיק את כפתור ההפעלה עד \"Loading startup options\" ← Options ← Continue (Recovery).",
   "Safe Mode ב-Apple Silicon: בתפריט האתחול לבחור את הדיסק, להחזיק Shift ולבחור \"Continue in Safe Mode\".",
   "Intel: Cmd+R בזמן האתחול = Recovery; Shift = Safe Mode; Option = בחירת דיסק; Cmd+Option+P+R = איפוס NVRAM (20 שניות); D = אבחון חומרה.",
   "Apple Silicon: אין איפוס NVRAM/SMC ידני. הפעלה מחדש מלאה (כיבוי ל-30 שניות) מתקנת בדרך כלל.",
   "Recovery מאפשר: Restore from Time Machine, Reinstall macOS, Safari, Disk Utility, Terminal (resetpassword, csrutil).",
   "Apple Diagnostics: Apple Silicon: להחזיק את ההפעלה ← Cmd+D.",
   "מסך נעילה (Activation Lock/MDM): צריך את ה-Apple ID או ה-IT."
  ],
  "ifNotWorking": "אם לא עולה אחרי עדכון: Safe Mode, ואם לא, Recovery ← Disk Utility ← First Aid, ולבסוף Reinstall macOS (לא מוחק נתונים).",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "boot",
   "recovery",
   "safe mode",
   "nvram",
   "smc",
   "startup",
   "אתחול",
   "apple silicon",
   "intel",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-mdm-profiles",
  "titleHe": "macOS MDM ופרופילים: מצב רישום ובדיקה (Jamf/Intune)",
  "titleEn": "macOS MDM and profiles",
  "category": "macOS",
  "symptom": "Mac ארגוני: הגדרה לא חלה, אפליקציה לא מותקנת, או צריך לבדוק האם המכשיר רשום ב-MDM.",
  "commands": [
   {
    "label": "פרופילים מותקנים",
    "text": "sudo profiles list"
   },
   {
    "label": "פרופיל מפורט",
    "text": "sudo profiles show -type configuration"
   },
   {
    "label": "מצב רישום MDM/DEP",
    "text": "profiles status -type enrollment"
   },
   {
    "label": "רענון הרישום",
    "text": "sudo profiles renew -type enrollment"
   },
   {
    "label": "Jamf: דיווח מלא",
    "text": "sudo jamf recon"
   },
   {
    "label": "Jamf: הרצת מדיניות",
    "text": "sudo jamf policy"
   },
   {
    "label": "Jamf: מצב",
    "text": "jamf checkJSSConnection"
   }
  ],
  "guiSteps": [
   "System Settings ← General ← Device Management (או Profiles): כל הפרופילים ומי שולח אותם.",
   "פרופיל לא חל: לבדוק Scope ב-MDM, שהמכשיר מחובר לאינטרנט, ו-sudo profiles renew.",
   "מכשיר Supervised/ADE: אי אפשר להסיר את ה-MDM בעצמך."
  ],
  "ifNotWorking": "",
  "notes": "לא מוחקים פרופיל MDM בעצמם. כל הגדרות האבטחה תלויות בו. פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "mdm",
   "profiles",
   "jamf",
   "intune",
   "kandji",
   "dep",
   "ade",
   "management",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-remote-access",
  "titleHe": "macOS גישה מרחוק: SSH, Screen Sharing ו-RDP לשרת",
  "titleEn": "macOS remote access: SSH, Screen Sharing, RDP",
  "category": "macOS",
  "symptom": "צריך להתחבר ל-Mac מרחוק, או מה-Mac לשרתי Windows.",
  "commands": [
   {
    "label": "הפעלת SSH (Remote Login)",
    "text": "sudo systemsetup -setremotelogin on"
   },
   {
    "label": "מצב SSH",
    "text": "sudo systemsetup -getremotelogin"
   },
   {
    "label": "כיבוי SSH",
    "text": "sudo systemsetup -setremotelogin off"
   },
   {
    "label": "התחברות ל-Mac",
    "text": "ssh <USER>@<MAC-IP>"
   },
   {
    "label": "Apple Remote Desktop kickstart",
    "text": "sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart -activate -configure -access -on -privs -all -restart -agent -menu"
   },
   {
    "label": "כתובת Mac ברשת",
    "text": "ipconfig getifaddr en0"
   },
   {
    "label": "חיבור SSH לשרת עם מפתח",
    "text": "ssh -i ~/.ssh/id_ed25519 <USER>@<HOST>"
   }
  ],
  "guiSteps": [
   "System Settings ← General ← Sharing ← Remote Login (SSH) / Screen Sharing / Remote Management.",
   "Terminal צריך Full Disk Access כדי להפעיל systemsetup -setremotelogin.",
   "RDP לשרת Windows: Windows App (בעבר Microsoft Remote Desktop) מה-App Store ← Add PC ← <TS-SERVER> ← Credentials.",
   "חיבור Screen Sharing ל-Mac אחר: Finder ← Go ← Connect to Server ← vnc://<IP>.",
   "לא לחשוף SSH/VNC לאינטרנט. רק דרך VPN."
  ],
  "ifNotWorking": "SSH נדחה: Remote Login כבוי או המשתמש לא ברשימה (Allow access for). Screen Sharing: לוודא Firewall פתוח.",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "ssh",
   "remote login",
   "screen sharing",
   "vnc",
   "rdp",
   "windows app",
   "remote desktop",
   "systemsetup",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-time-sync",
  "titleHe": "macOS שעה ותאריך: סנכרון NTP",
  "titleEn": "macOS time sync NTP",
  "category": "macOS",
  "symptom": "השעה שגויה: שוברת Kerberos/AD, תעודות HTTPS ו-VPN.",
  "commands": [
   {
    "label": "מצב שעה",
    "text": "date"
   },
   {
    "label": "שרת NTP",
    "text": "sudo systemsetup -getnetworktimeserver"
   },
   {
    "label": "סנכרון מיידי",
    "text": "sudo sntp -sS time.apple.com"
   },
   {
    "label": "קביעת שרת",
    "text": "sudo systemsetup -setnetworktimeserver <NTP-SERVER>"
   },
   {
    "label": "סנכרון אוטומטי פעיל?",
    "text": "sudo systemsetup -getusingnetworktime"
   },
   {
    "label": "הפעלת סנכרון",
    "text": "sudo systemsetup -setusingnetworktime on"
   }
  ],
  "guiSteps": [
   "System Settings ← General ← Date & Time ← Set time and date automatically ← Source.",
   "ארגון עם AD: להגדיר מקור זמן ל-DC (למשל <DC>.<domain.local>).",
   "אזור זמן: Date & Time ← Time zone ← Set automatically based on current location."
  ],
  "ifNotWorking": "",
  "notes": "פער זמן של יותר מ-5 דקות שובר Kerberos. פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "time",
   "ntp",
   "date",
   "sntp",
   "שעה",
   "sync",
   "kerberos",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-time-machine",
  "titleHe": "macOS Time Machine: גיבוי, סטטוס ושחזור",
  "titleEn": "macOS Time Machine backup and restore",
  "category": "macOS",
  "symptom": "בדיקת גיבוי, גיבוי תקוע, או שחזור קבצים/מערכת.",
  "commands": [
   {
    "label": "סטטוס",
    "text": "tmutil status"
   },
   {
    "label": "יעד הגיבוי",
    "text": "tmutil destinationinfo"
   },
   {
    "label": "גיבוי עכשיו",
    "text": "tmutil startbackup"
   },
   {
    "label": "עצירה",
    "text": "tmutil stopbackup"
   },
   {
    "label": "רשימת גיבויים",
    "text": "tmutil listbackups"
   },
   {
    "label": "גיבוי אחרון",
    "text": "tmutil latestbackup"
   },
   {
    "label": "החרגת תיקייה",
    "text": "sudo tmutil addexclusion <PATH>"
   }
  ],
  "guiSteps": [
   "System Settings ← General ← Time Machine ← Add Backup Disk.",
   "שחזור קבצים: פתח את התיקייה ← סמל Time Machine ← Enter Time Machine ← בחר גרסה ← Restore.",
   "שחזור כל המערכת: Recovery ← Restore from Time Machine Backup. או Migration Assistant בעת הגדרת מק חדש.",
   "ארגון: Time Machine אינו תחליף לגיבוי שרת/ענן. לדעת מה המדיניות."
  ],
  "ifNotWorking": "גיבוי נעצר: דיסק מלא או מנותק, לבדוק tmutil status ושאין Local Snapshots ענקיים.",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "time machine",
   "backup",
   "גיבוי",
   "tmutil",
   "restore",
   "שחזור",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-battery-hardware",
  "titleHe": "macOS סוללה וחומרה: מצב סוללה, חשמל, חום",
  "titleEn": "macOS battery and hardware health",
  "category": "macOS",
  "symptom": "סוללה מתרוקנת מהר, נראית נפוחה, המק מתכבה, או צריך להחליט האם להחליף.",
  "commands": [
   {
    "label": "מצב סוללה",
    "text": "pmset -g batt"
   },
   {
    "label": "מחזורים ובריאות",
    "text": "system_profiler SPPowerDataType | grep -E \"Cycle Count|Condition|Maximum Capacity\""
   },
   {
    "label": "מי מונע שינה",
    "text": "pmset -g assertions"
   },
   {
    "label": "יומן החשמל (בדיקת התעוררויות)",
    "text": "pmset -g log | tail -30"
   },
   {
    "label": "הגדרות חשמל",
    "text": "pmset -g"
   },
   {
    "label": "מניעת שינה ל-60 דקות",
    "text": "caffeinate -t 3600"
   },
   {
    "label": "טמפרטורת/מאוורר (Apple Silicon: דורש sudo)",
    "text": "sudo powermetrics --samplers smc -i 1000 -n 1"
   }
  ],
  "guiSteps": [
   "System Settings ← Battery ← Battery Health: Maximum Capacity ו-Condition.",
   "מתחת ל-80% קיבולת או Service Recommended: להחליף סוללה.",
   "סוללה נפוחה (משטח עקום/טראקפד עולה): להפסיק להשתמש ולהעביר לשירות.",
   "Apple Diagnostics: ראה \"אתחול, Safe Mode ו-Recovery\".",
   "טעינה לא עובדת: כבל/מתאם מקור, ניקוי יציאה, ובדיקה במתאם אחר."
  ],
  "ifNotWorking": "",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "battery",
   "סוללה",
   "pmset",
   "power",
   "cycle count",
   "sleep",
   "hardware",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-outlook-office",
  "titleHe": "macOS Outlook ו-Microsoft 365: כניסה ובעיות נפוצות",
  "titleEn": "macOS Outlook / M365 login issues",
  "category": "macOS",
  "symptom": "Outlook for Mac מבקש כניסה שוב ושוב, לא מסנכרן, או קורס. לרוב בעיית Keychain, אימות או פרופיל.",
  "commands": [
   {
    "label": "רשומות Microsoft ב-Keychain (לצפייה)",
    "text": "security dump-keychain 2>/dev/null | grep -i \"microsoft\" | head"
   },
   {
    "label": "אפליקציות Office מותקנות",
    "text": "ls /Applications | grep -i \"Microsoft\""
   },
   {
    "label": "Autodiscover של הדומיין",
    "text": "dig +short CNAME autodiscover.<DOMAIN>"
   },
   {
    "label": "בדיקת הגעה ל-M365",
    "text": "curl -I https://outlook.office365.com"
   }
  ],
  "guiSteps": [
   "להתנתק מ-Office ולהתחבר מחדש: Outlook ← Settings ← Accounts ← Remove ← Add Account.",
   "Keychain Access: למחוק רשומות Microsoft Office Identities, com.microsoft.adalcache, MicrosoftOffice* ולהתחבר מחדש.",
   "ב-Mac מנוהל עם SSO/Entra: Company Portal מוודא שהמכשיר Compliant. Platform SSO: ראה \"AD, Kerberos ו-SSO\".",
   "Outlook איטי או תקוע בסנכרון: Outlook ← Help ← Repair Database (או Outlook Profile Manager) והפעלה מחדש.",
   "Office נתקע בעדכון: Help ← Check for Updates (Microsoft AutoUpdate).",
   "בעיות MFA: לבדוק זמן המכשיר ואפליקציית Authenticator."
  ],
  "ifNotWorking": "אם נשאר: ליצור פרופיל חדש, או להתקין מחדש (גיבוי Archive לפני כן).",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "outlook",
   "office",
   "m365",
   "microsoft 365",
   "exchange",
   "entra",
   "sso",
   "keychain",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-terminal-toolkit",
  "titleHe": "macOS פקודות Terminal שימושיות ל-Help Desk",
  "titleEn": "macOS terminal toolkit for help desk",
  "category": "macOS",
  "symptom": "כלים יומיומיים שחוסכים לחיצות: Finder, קבצים מוסתרים, הגדרות מערכת, הפעלת אפליקציות, העתקה ללוח.",
  "commands": [
   {
    "label": "להציג קבצים מוסתרים ב-Finder",
    "text": "defaults write com.apple.finder AppleShowAllFiles -bool true && killall Finder"
   },
   {
    "label": "להסתיר שוב",
    "text": "defaults write com.apple.finder AppleShowAllFiles -bool false && killall Finder"
   },
   {
    "label": "פתיחת התיקייה הנוכחית ב-Finder",
    "text": "open ."
   },
   {
    "label": "פתיחת אפליקציה",
    "text": "open -a \"Safari\""
   },
   {
    "label": "פתיחת הגדרות",
    "text": "open \"x-apple.systempreferences:com.apple.Network-Settings.extension\""
   },
   {
    "label": "העתקה ללוח",
    "text": "echo \"text\" | pbcopy"
   },
   {
    "label": "הדבקה מהלוח",
    "text": "pbpaste"
   },
   {
    "label": "קובץ בשולחן העבודה לשיתוף מהיר",
    "text": "zip -r ~/Desktop/logs.zip ~/Library/Logs/DiagnosticReports"
   },
   {
    "label": "מניעת שינה בזמן פקודה",
    "text": "caffeinate -i <COMMAND>"
   },
   {
    "label": "מי אני, איזה משתמש",
    "text": "whoami; id"
   },
   {
    "label": "מצב SIP",
    "text": "csrutil status"
   },
   {
    "label": "צילום מסך מהטרמינל",
    "text": "screencapture -x ~/Desktop/shot.png"
   },
   {
    "label": "מתי נטען האתחול האחרון",
    "text": "sysctl -n kern.boottime"
   },
   {
    "label": "הפעלה מחדש / כיבוי",
    "text": "sudo shutdown -r now"
   },
   {
    "label": "חיפוש טקסט בקבצים",
    "text": "grep -ri \"<TEXT>\" <FOLDER>"
   },
   {
    "label": "צפייה בקובץ plist",
    "text": "plutil -p ~/Library/Preferences/<FILE>.plist"
   }
  ],
  "guiSteps": [
   "Cmd+Shift+. מציג/מסתיר קבצים מוסתרים ב-Finder בלי טרמינל.",
   "Finder ← Go ← Go to Folder (Cmd+Shift+G) ← ~/Library.",
   "Spotlight (Cmd+Space) ← Terminal."
  ],
  "ifNotWorking": "",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "terminal",
   "cli",
   "defaults",
   "open",
   "pbcopy",
   "csrutil",
   "caffeinate",
   "tools",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-shortcuts",
  "titleHe": "macOS קיצורי מקלדת חשובים",
  "titleEn": "macOS essential keyboard shortcuts",
  "category": "macOS",
  "symptom": "קיצורים שחוסכים זמן בעבודה מול משתמשים ובפתרון תקלות. Cmd = ⌘, Option = ⌥.",
  "commands": [],
  "guiSteps": [
   "Cmd+Space: Spotlight. Cmd+Tab: החלפת אפליקציה. Cmd+`: החלפת חלון באותה אפליקציה.",
   "Cmd+Option+Esc: Force Quit. Cmd+Q: יציאה מאפליקציה. Cmd+W: סגירת חלון. Cmd+H: הסתרה.",
   "Cmd+Shift+3: צילום מסך מלא. Cmd+Shift+4: אזור. Cmd+Shift+5: תפריט צילום והקלטה.",
   "Cmd+Shift+G: Go to Folder. Cmd+Shift+. : קבצים מוסתרים. Cmd+K: Connect to Server.",
   "Cmd+Delete: העברה לפח. Cmd+Shift+Delete: ריקון פח. Cmd+I: Get Info. Cmd+D: שכפול.",
   "Cmd+C / V / X: העתק, הדבק, גזור. Option+Cmd+V: הדבקה כהעברה (Move).",
   "Ctrl+Cmd+Q: נעילת מסך. Cmd+Shift+Q: Log Out. Ctrl+Option+Cmd+Power: כיבוי.",
   "Cmd+, : הגדרות האפליקציה. Cmd+Z / Shift+Cmd+Z: Undo / Redo. Cmd+F: חיפוש.",
   "Cmd+Ctrl+Space: Emoji ותווים. Option+Shift+K: סמל Apple.",
   "Cmd+Option+D: הסתרה/הצגת Dock. Ctrl+Up: Mission Control. Ctrl+Left/Right: החלפת Desktop.",
   "Fn+E או Ctrl+Cmd+Space: אימוג׳י. Fn+F: מסך מלא (בחלק מהדגמים).",
   "Option+קליק על סמל Wi-Fi/Bluetooth/Sound: מידע מורחב.",
   "בעת אתחול: ראה \"אתחול, Safe Mode ו-Recovery\"."
  ],
  "ifNotWorking": "",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "shortcuts",
   "קיצורים",
   "keyboard",
   "cmd",
   "force quit",
   "screenshot",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 },
 {
  "id": "mac-vs-windows-cheatsheet",
  "titleHe": "macOS מול Windows: טבלת המרה לפקודות Help Desk",
  "titleEn": "macOS vs Windows command mapping",
  "category": "macOS",
  "symptom": "מומחה Windows שעובר ל-Mac: איזו פקודה בטרמינל עונה על איזו פקודה מוכרת.",
  "commands": [
   {
    "label": "ipconfig ← ",
    "text": "ipconfig getifaddr en0   # או ifconfig"
   },
   {
    "label": "ipconfig /all ← ",
    "text": "networksetup -getinfo \"Wi-Fi\"; scutil --dns"
   },
   {
    "label": "ipconfig /flushdns ← ",
    "text": "sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder"
   },
   {
    "label": "ipconfig /renew ← ",
    "text": "sudo ipconfig set en0 DHCP"
   },
   {
    "label": "tracert ← ",
    "text": "traceroute <HOST>"
   },
   {
    "label": "nslookup ← ",
    "text": "nslookup / dig"
   },
   {
    "label": "Test-NetConnection -Port ← ",
    "text": "nc -vz <HOST> <PORT>"
   },
   {
    "label": "netstat -ano ← ",
    "text": "lsof -i -n -P"
   },
   {
    "label": "tasklist / taskkill ← ",
    "text": "ps aux / killall <APP> (או kill -9 <PID>)"
   },
   {
    "label": "systeminfo ← ",
    "text": "system_profiler SPHardwareDataType; sw_vers"
   },
   {
    "label": "whoami /groups ← ",
    "text": "id"
   },
   {
    "label": "gpresult ← ",
    "text": "sudo profiles show -type configuration"
   },
   {
    "label": "sfc /scannow ← ",
    "text": "diskutil verifyVolume /"
   },
   {
    "label": "chkdsk ← ",
    "text": "diskutil repairVolume /"
   },
   {
    "label": "Event Viewer ← ",
    "text": "Console.app / log show"
   },
   {
    "label": "Task Manager ← ",
    "text": "Activity Monitor / top"
   },
   {
    "label": "Services.msc ← ",
    "text": "launchctl list; sudo launchctl kickstart -k system/<LABEL>"
   },
   {
    "label": "Get-HotFix ← ",
    "text": "softwareupdate --history"
   },
   {
    "label": "net use ← ",
    "text": "mount_smbfs / open smb://"
   },
   {
    "label": "shutdown /r ← ",
    "text": "sudo shutdown -r now"
   },
   {
    "label": "Regedit ← ",
    "text": "defaults read/write; plutil -p (קבצי plist)"
   },
   {
    "label": "BitLocker ← ",
    "text": "fdesetup status (FileVault)"
   },
   {
    "label": "Defender ← ",
    "text": "XProtect + Gatekeeper (מובנה): spctl --status"
   }
  ],
  "guiSteps": [
   "הכלל: ב-Mac ההגדרות נשמרות בקובצי plist (בקבוצות ~/Library/Preferences ו-/Library/Preferences), ולא ברגיסטרי.",
   "לא קיים \"Run as Administrator\": ב-Mac משתמשים ב-sudo (מבקש סיסמת מנהל).",
   "Windows+R ← Cmd+Space; Win+E (Explorer) ← Cmd+N (Finder); Alt+Tab ← Cmd+Tab; Ctrl+Alt+Del ← Cmd+Option+Esc."
  ],
  "ifNotWorking": "",
  "notes": "פקודות לפי macOS 14-15 (Sonoma/Sequoia); בגרסאות אחרות חלק מהשמות והנתיבים משתנים. פקודות עם sudo מבקשות סיסמת מנהל. בטרמינל של ה-Mac (Terminal).",
  "tags": [
   "windows",
   "mapping",
   "המרה",
   "cheatsheet",
   "ipconfig",
   "taskkill",
   "comparison",
   "mac",
   "macos",
   "apple"
  ],
  "createdAt": 1760600000000,
  "updatedAt": 1760600000000
 }
];
