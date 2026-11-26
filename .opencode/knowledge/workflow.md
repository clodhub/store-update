# Local workflow

Repository: `clodhub/store-update`. Licence: `Apache-2.0` (`LICENCE`, `NOTICE`).

Commands from the package root: `node --test tests/web.test.ts`, `python3 tests/native.py apple`, `node --test tests/regression.test.ts`, `python3 tests/native.py android` (kotlinc is not installed here, so the Android check does not run).
Review a fetched archive: `python3 -m clod review <digest> --store STORE --policy POLICY --trusted --allow-network`. Always `-B`.
