# EcoTrack AI Security Threat Model

## Philosophy
"Never trust the client."

## Identified Threats & Mitigations

### 1. Arbitrary Data Injection (Fixed)
- **Threat:** Malicious actors could send a payload with `ecoScore: 99999` to manipulate global aggregates via client-side Firestore transactions.
- **Mitigation:** Removed client write access to `communityStats` and `communityLeaderboard`. Aggregation is now driven exclusively by authenticated backend triggers (Cloud Functions) reading validated user inputs.

### 2. Privilege Escalation
- **Threat:** Users updating their own `role` field in the `users` collection to `admin`.
- **Mitigation:** The `firestore.rules` specifically uses the `isUnmodified('role')` helper function on user updates, ensuring users cannot elevate their own privileges.

### 3. Hardcoded Admin Vulnerabilities (Fixed)
- **Threat:** The legacy rules relied on a hardcoded email (`jeevansagale9@gmail.com`) for owner access.
- **Mitigation:** Refactored rules to check for custom claims (`request.auth.token.admin == true`) or database roles (`getUserData().role == 'owner'`).

### 4. Rate Limiting
- **Current State:** Handled weakly on the client.
- **Future Roadmap:** Cloud Functions should implement sliding window rate limiters (e.g., max 5 assessments per hour per IP/UID) to prevent DDoS against backend aggregation functions.

### 5. OWASP Considerations
- No direct SQL injection risk (NoSQL).
- XSS risk minimized by React's standard escaping.
- Data exposure is strictly scoped via `isSelf(userId)` read rules.
