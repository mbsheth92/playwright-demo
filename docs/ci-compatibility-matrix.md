# CI Compatibility Matrix & Gates

| Gate | Component/Version | Dataset (Seeded) | Positive Cases | Negative / Fault Cases | Pass Criteria |
|------|-------------------|------------------|----------------|------------------------|---------------|
| Unit | Node.js 20.x, 22.x | Mocked JSON fixtures | RPC 200, CLI exit 0 | RPC timeout, invalid CLI arg | 100% unit pass |
| Integration | API v1.3 / v2.0 | Seeded DB: 10 users, 50 txns | CRUD via RPC | Invalid JWT, missing field, SQL injection | All expected errors handled |
| System | Docker images: latest, stable | Full seeded data | E2E happy paths | Service down, network fault, 429 throttling | No crash, graceful error |
| Regression | Chrome/Firefox/WebKit | Prod-like seed | Full regression suite | Fault injection (DB kill, API 500) | < 2% flakiness |
| Performance | K6/JMeter 500 VUs | 1M records | Steady <200ms | Spike + soak | KPIs met |
