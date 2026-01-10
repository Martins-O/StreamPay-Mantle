# Security Policy

## Overview

Liquifi Protocol handles real-world financial assets and sensitive business data. This document outlines our security practices, vulnerability reporting process, and best practices for developers.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Security Best Practices

### For Developers

#### 1. Environment Variables & Secrets

**CRITICAL**: Never commit private keys or sensitive credentials to version control.

```bash
# ✅ GOOD - Use .env files (already in .gitignore)
RISK_SIGNER_PRIVATE_KEY=0x...

# ❌ BAD - Never hardcode keys in source files
const privateKey = "0x1ed549bc8b1e39ed8c55ec3c150ecfd751207e8f65c72b3854845490ced15e4f"
```

**Protected Files:**
- `backend/.env` - Contains risk signer private key
- `contracts/.env` - Contains deployment private key
- `ai-service/.env` - Contains service configuration
- `frontend/.env.local` - Contains API keys

**Safe Practices:**
- Use `.env.example` files as templates
- Store production keys in secure vaults (AWS Secrets Manager, HashiCorp Vault, etc.)
- Rotate keys regularly (minimum: quarterly)
- Use hardware wallets for mainnet deployments
- Never share private keys via Slack, email, or chat

#### 2. Smart Contract Security

**Audited Components:**
- StreamEngine: Multi-token streaming with pause/resume
- YieldPool: Share-based vault with risk gating
- RiskOracleAdapter: EIP-712 signature verification
- StreamVault: Escrow with reentrancy guards

**Security Features:**
- ✅ ReentrancyGuard on all external fund transfers
- ✅ Access control via OpenZeppelin's Ownable
- ✅ EIP-712 signature verification for risk scores
- ✅ SafeERC20 for token interactions
- ✅ Integer overflow protection (Solidity 0.8.30)

**Testing:**
- 30+ unit tests with 100% pass rate
- Fuzz testing via Foundry
- Slither static analysis recommended before mainnet

#### 3. Backend API Security

**Implemented Protections:**
- CORS configuration (restrict origins in production)
- Input validation with Zod schemas
- Rate limiting (recommended: 100 req/min per IP)
- Error messages sanitized (no stack traces in production)

**Authentication Flow:**
```
Business → Sign message → Backend verifies signature → Sign risk payload
```

**Risk Signer Key:**
- Kept in backend/.env (never exposed to frontend)
- Used to sign EIP-712 risk payloads
- Verified on-chain by RiskOracleAdapter

#### 4. Frontend Security

**Best Practices:**
- Never store private keys in localStorage/sessionStorage
- Validate all user inputs before submission
- Sanitize data received from backend
- Use WalletConnect for mobile wallet security
- Display clear transaction previews before signing

**Web3 Wallet Security:**
- Always verify contract addresses before interaction
- Prompt users to review transaction details
- Implement spending limits for ERC-20 approvals
- Show clear error messages for failed transactions

---

## Vulnerability Disclosure

### Reporting a Vulnerability

If you discover a security vulnerability, please follow responsible disclosure:

**DO:**
1. Email security@liquifi.io with subject "Security Vulnerability Report"
2. Include detailed description, steps to reproduce, and impact assessment
3. Wait for confirmation (we aim to respond within 48 hours)
4. Allow 90 days for fix before public disclosure

**DO NOT:**
- Publicly disclose the vulnerability before patch is deployed
- Test vulnerabilities on mainnet or with real funds
- Exploit vulnerabilities for financial gain

### What We Need

Please include in your report:
- **Description**: What is the vulnerability?
- **Impact**: What's the worst-case scenario?
- **Reproduction**: Step-by-step instructions
- **Affected Components**: Contracts, backend, frontend, etc.
- **Suggested Fix**: (optional but appreciated)

### Severity Classification

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical** | Funds at risk, contract exploitable | 24 hours |
| **High** | Data leak, authentication bypass | 48 hours |
| **Medium** | DoS, logic errors | 1 week |
| **Low** | Information disclosure, UI bugs | 2 weeks |

### Bug Bounty Program

**Coming Soon**: We plan to launch a bug bounty program on Immunefi after mainnet launch.

**Estimated Rewards:**
- Critical: $5,000 - $50,000
- High: $1,000 - $5,000
- Medium: $500 - $1,000
- Low: $100 - $500

---

## Known Security Considerations

### Smart Contracts

1. **Oracle Dependency**
   - Risk scores depend on off-chain AI service
   - Mitigation: EIP-712 signatures prevent unauthorized scores
   - Fallback: Manual override by contract owner

2. **Yield Pool Capacity**
   - Risk-gated capacity could be manipulated by gaming AI scores
   - Mitigation: Deterministic scoring prevents gaming
   - Future: Integrate external credit data (Dun & Bradstreet, etc.)

3. **Stream Cancelation**
   - Businesses can cancel streams prematurely
   - Mitigation: Penalty fees for early cancellation
   - Future: Require multi-sig for cancellation

### Backend

1. **Risk Signer Key**
   - Single point of failure if compromised
   - Mitigation: Key rotation policy, monitoring
   - Future: Multi-signature risk oracle

2. **AI Service Availability**
   - Backend depends on AI service being online
   - Mitigation: Caching, retry logic
   - Future: Fallback to cached scores

### Frontend

1. **Web3 Wallet Phishing**
   - Users could be tricked into signing malicious transactions
   - Mitigation: Clear transaction previews, contract verification
   - Future: WalletConnect v2 with verified domain

---

## Security Checklist for Deployments

### Pre-Mainnet Checklist

- [ ] Smart contract audit by reputable firm
- [ ] Testnet deployment with 1-week public testing
- [ ] Fuzz testing on all financial functions
- [ ] Key rotation procedures documented
- [ ] Incident response plan established
- [ ] Insurance coverage for smart contract risks
- [ ] Bug bounty program launched
- [ ] Monitoring & alerting configured
- [ ] Rate limiting on all API endpoints
- [ ] DDoS protection (Cloudflare, etc.)

### Production Environment

```bash
# Contracts
- [ ] Deploy with hardware wallet
- [ ] Verify contracts on Mantle Explorer
- [ ] Renounce ownership or transfer to multisig
- [ ] Set up monitoring for contract events

# Backend
- [ ] Use environment secrets (not .env files)
- [ ] Enable HTTPS only (no HTTP)
- [ ] Configure rate limiting (100 req/min)
- [ ] Set up Sentry for error tracking
- [ ] Configure log retention (30 days minimum)

# Frontend
- [ ] Deploy to CDN with DDoS protection
- [ ] Enable CSP headers
- [ ] Verify contract addresses in production build
- [ ] Test on multiple browsers and mobile
```

---

## Security Tools & Resources

### Recommended Tools

**Smart Contracts:**
- [Slither](https://github.com/crytic/slither) - Static analyzer
- [Mythril](https://github.com/ConsenSys/mythril) - Symbolic execution
- [Foundry Fuzz](https://book.getfoundry.sh/forge/fuzz-testing) - Fuzz testing

**Backend:**
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency scanning
- [Snyk](https://snyk.io/) - Vulnerability monitoring
- [OWASP ZAP](https://www.zaproxy.org/) - API security testing

**Frontend:**
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Security audit
- [Observatory](https://observatory.mozilla.org/) - HTTP security headers

### Educational Resources

- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Ethers.js Security](https://docs.ethers.org/v6/security/)
- [Foundry Security](https://book.getfoundry.sh/tutorials/best-practices)

---

## Contact

- **Security Email**: security@liquifi.io
- **Twitter**: [@liquifi](https://twitter.com/liquifi)
- **Discord**: [Join our server](https://discord.gg/liquifi) (coming soon)

---

## Acknowledgments

We thank the security researchers who help make Liquifi safer:

| Researcher | Finding | Reward |
|------------|---------|--------|
| TBD | TBD | TBD |

---

**Last Updated**: 2026-01-09

**Version**: 1.0.0
