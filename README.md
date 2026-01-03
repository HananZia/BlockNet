**BlockNet**

BlockNet is a blockchain-based file verification and secure-sharing application that helps users verify file integrity and share authenticated files securely. By recording file hashes on a blockchain, BlockNet provides tamper-evident proof of a file's authenticity.

**Project Overview**

BlockNet lets users:

- Register and authenticate accounts
- Upload files and verify their integrity
- Detect whether a file has been tampered with
- Securely share verified files with other users
- Maintain trust via a blockchain-backed verification system

Each file is cryptographically hashed and recorded on the blockchain, ensuring transparency, immutability, and authenticity.

**Why Blockchain?**

Traditional file-sharing systems cannot reliably prove whether a file has been altered. BlockNet addresses this by:

- Storing file hashes on a blockchain
- Making file records immutable
- Allowing instant verification against the blockchain ledger

Once recorded, a file's integrity can be checked at any time.

**Tech Stack**

Backend

- Flask — RESTful API server
- Custom Python blockchain implementation (backend/blockchain.py)
- SQLite — lightweight database for users and metadata

Frontend

- React — user interface
- Expo — development and testing
- Capacitor CLI — native Android integration
- Android Studio — Android builds & emulator support

**Application Flow**

1. User registration — create and authenticate an account.
2. File upload — user uploads a file and the system generates a cryptographic hash.
3. Blockchain record — the hash is stored in a new blockchain block.
4. File verification — users can re-upload or check a file; hash comparison shows whether it is authentic or tampered.
5. Secure sharing — verified files can be securely shared; the blockchain ensures authenticity.

**Core Features**

- User authentication
- File integrity verification
- Blockchain-backed hash storage
- Tamper detection
- Secure peer-to-peer file sharing
- Android-ready application


**Installation & Setup**

Backend (Flask)

```bash
cd backend
python -m venv venv
# macOS / Linux
source venv/bin/activate
# Windows PowerShell
venv\Scripts\Activate.ps1
# Windows (cmd.exe)
venv\Scripts\activate.bat
pip install -r requirements.txt
python app.py
```

Frontend (Expo + React)

```bash
cd BlocknetApp
npm install
npx expo start
```

Android Build (Capacitor)

```bash
npx cap sync android
npx cap open android
```

**Use Cases**

- Verifying academic documents
- Secure sharing of legal files
- Authenticating digital assets
- Ensuring file integrity across networks

**Future Enhancements**

- Multi-node blockchain support
- Public/private key encryption for file access
- Cloud-backed file storage options
- Web dashboard and administrative views
- iOS support
- Smart contract integration for advanced workflows

**Group Members**

-Muhammad Hanan Zia
-Muhammad Haris
-Amna Imran
