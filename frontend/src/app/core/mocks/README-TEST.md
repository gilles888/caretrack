# CareTrack — Comptes de test mock

Date de reference des donnees : **2026-03-11**

---

## Medecins

| ID         | Email                          | Mot de passe   | Specialite        | Nb patients | Notes                   |
|------------|--------------------------------|----------------|-------------------|-------------|-------------------------|
| u-sm-001   | sophie.martin@caretrack.fr     | Medecin1234!   | Cardiologie       | 12          |                         |
| u-kb-002   | karim.benali@caretrack.fr      | Medecin1234!   | Medecine generale | 8           |                         |
| u-ar-003   | anne.rousseau@caretrack.fr     | Medecin1234!   | Oncologie         | 5           | premiereConnexion: true |

---

## Patients

| ID         | Email                              | Mot de passe  | Age | Sexe | Medecin    | Pathologie                      | Statut      | Notes                     |
|------------|------------------------------------|---------------|-----|------|------------|---------------------------------|-------------|---------------------------|
| u-jd-101   | jean.dupont@gmail.com              | Patient1234!  | 67  | M    | u-sm-001   | Insuffisance cardiaque chronique | ACTIF       |                           |
| u-ml-102   | marie.leblanc@gmail.com            | Patient1234!  | 54  | F    | u-sm-001   | Hypertension + diabete type 2   | ACTIF       | Alerte CRITIQUE active    |
| u-pm-103   | pierre.moreau@hotmail.com          | Patient1234!  | 45  | M    | u-kb-002   | Depression post-AVC             | ACTIF       | Questionnaire EN_RETARD   |
| u-fo-104   | fatima.ouali@gmail.com             | Patient1234!  | 38  | F    | u-ar-003   | Suivi post-chimiotherapie       | ONBOARDING  | Aucun questionnaire       |
| u-rk-105   | robert.klein@orange.fr             | Patient1234!  | 72  | M    | u-kb-002   | —                               | INACTIF     | rgpdRetire: true          |
| u-lb-106   | lucie.bernard.parent@gmail.com     | Patient1234!  | 16  | F    | u-kb-002   | Epilepsie pediatrique           | ACTIF       | representantLegal: true   |

---

## Administrateurs

| ID         | Email                   | Mot de passe  | Role          | Permissions                                        |
|------------|-------------------------|---------------|---------------|----------------------------------------------------|
| u-adm-001  | admin@caretrack.fr      | Admin5678!    | ADMIN         | CRUD_USERS, STATS, EXPORT_RGPD, AUDIT_LOG          |
| u-adm-002  | support@caretrack.fr    | Support5678!  | ADMIN_SUPPORT | READ_ONLY, RESET_PASSWORD                          |

---

## Questionnaires

| ID     | Patient      | Medecin    | Template | Statut     | Score | Niveau    | Notes                                   |
|--------|--------------|------------|----------|------------|-------|-----------|-----------------------------------------|
| q-001  | u-jd-101     | u-sm-001   | PHQ9     | COMPLETE   | 72    | NORMAL    | Envoye J-30, repondu J-28              |
| q-002  | u-jd-101     | u-sm-001   | PHQ9     | COMPLETE   | 68    | NORMAL    | Envoye J-14, repondu J-13              |
| q-003  | u-jd-101     | u-sm-001   | PHQ9     | COMPLETE   | 75    | NORMAL    | Envoye J-2, repondu J-1                |
| q-004  | u-ml-102     | u-sm-001   | ESAS_R   | COMPLETE   | 65    | ATTENTION | Envoye J-14, repondu J-13              |
| q-005  | u-ml-102     | u-sm-001   | ESAS_R   | COMPLETE   | 28    | CRITIQUE  | Hier — douleur 9/10 — alerte generee   |
| q-006  | u-pm-103     | u-kb-002   | PHQ9     | EN_RETARD  | null  | null      | Envoye J-8, aucune reponse             |

---

## Alertes

| ID    | Patient    | Medecin    | Type            | Niveau    | Statut  | Lu    | Notes                           |
|-------|------------|------------|-----------------|-----------|---------|-------|---------------------------------|
| a-001 | u-ml-102   | u-sm-001   | SCORE_CRITIQUE  | CRITIQUE  | ACTIVE  | false | Creee hier — non resolue        |
| a-002 | u-pm-103   | u-kb-002   | NON_COMPLIANCE  | ATTENTION | ACTIVE  | true  | Creee il y a 3 jours            |
| a-003 | u-jd-101   | u-sm-001   | SCORE_CRITIQUE  | ATTENTION | RESOLUE | true  | Resolue il y a 10 jours         |

---

## Scenarios de test recommandes

### Connexion et redirection
- **Medecin** : se connecter avec `sophie.martin@caretrack.fr` / `Medecin1234!` → redirection vers `/pro/formulaires`
- **Patient** : se connecter avec `jean.dupont@gmail.com` / `Patient1234!` → redirection vers `/patient/questionnaires`
- **Admin** : se connecter avec `admin@caretrack.fr` / `Admin5678!` → redirection vers `/pro/formulaires`
- **Echec** : email inconnu ou mauvais mot de passe → message d'erreur visible

### Dashboard medecin (Dr. Sophie Martin — u-sm-001)
- 2 patients actifs : Jean Dupont + Marie Leblanc
- 1 alerte CRITIQUE active (a-001 — Marie Leblanc)
- Taux de compliance : 100% (tous ses questionnaires sont COMPLETE)
- Aucun questionnaire en retard pour ses patients

### Dashboard medecin (Dr. Karim Benali — u-kb-002)
- 3 patients : Pierre Moreau, Robert Klein (INACTIF), Lucie Bernard
- 1 questionnaire EN_RETARD (q-006 — Pierre Moreau)
- 1 alerte ATTENTION active (a-002 — Pierre Moreau)

### Premiere connexion medecin
- Se connecter avec `anne.rousseau@caretrack.fr` → `premiereConnexion: true` permet de tester un onboarding wizard

### Patient ONBOARDING sans questionnaire
- Se connecter avec `fatima.ouali@gmail.com` → aucun questionnaire, espace vide a gerer

### Patient avec RGPD retire
- `robert.klein@orange.fr` → `rgpdRetire: true`, le compte doit etre masque ou inaccessible selon les regles

### Patient representant legal
- `lucie.bernard.parent@gmail.com` → `representantLegal: true`, mineur 16 ans

### Alerte critique en temps reel
- Marie Leblanc (u-ml-102) a soumis q-005 hier avec douleur 9/10 → alerte a-001 non lue
- `getAlertesActives('u-sm-001')` doit retourner [a-001]

---

## Notes techniques

- Toutes les dates sont relatives a `new Date('2026-03-11')`
- `MockDataService.login()` stocke dans localStorage : `access_token`, `user_role`, `user_id`, `user_nom`
- `authGuard` verifie uniquement la presence de `access_token` dans localStorage
- Les delais simules : 300ms pour auth/alertes/stats, 200ms pour patients/questionnaires
- `environment.development.ts` → `useMocks: true` (utiliser les mocks)
- `environment.ts` → `useMocks: false` (pointer vers l'API reelle)
