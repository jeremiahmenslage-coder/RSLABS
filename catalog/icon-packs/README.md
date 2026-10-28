# Owner-supplied local category icon packs — P5-004

Copy suitable PNG/WebP files into a project-local input directory, for example `catalog/icon-packs/my-pack-v1/icons/`. Add `manifest.json` with the versioned structure below. No in-app uploads, downloads, runtime APIs/CDNs or individual-goal artwork matching are used.

```json
{
  "format": 1,
  "id": "owner:icons:my-pack-v1",
  "version": "1.0.0",
  "assets": [{
    "id": "owner:icon:inventory-v1",
    "file": "icons/inventory.png",
    "mediaType": "image/png",
    "provenance": "Owner-supplied suitable Inventory symbol; record actual source/revision",
    "attribution": "Record source/Jagex/contributor credits and applicable notices",
    "permission": "Record actual Owner-provided private-local permission and source license"
  }],
  "categories": {"item": "owner:icon:inventory-v1"}
}
```

Add a Diary asset and map `diary` for a suitable Achievement Diary symbol. Supported mappings: skill, quest, item, boss, diary, activity, custom and legacy prayer. Omitted categories use the existing pinned defaults or original fallback; empty mappings, invalid categories or missing referenced assets reject. Manifest text is an Owner assertion, not independently verified permission or proof that an image depicts the right symbol; Owner/reviewer must check suitability. Do not label unrelated art as Inventory/Diary. Input files may remain unused; no file is deleted automatically.

Owner reports Jagex permission covering third-party sourcing/local bundling in this private planner. It is Owner-provided, not independently verified, and establishes no broader distribution rights. Preserve source attribution/licenses/notices separately with your inputs. Preparation embeds the supplied provenance, attribution and permission strings in its report. Existing Jagex/Wiki/Dava96 notices remain unchanged.

## Copy and run

From the existing checkout:

1. Copy your image files and complete the manifest. Supported images: PNG or WebP, 1–256 decoded pixels per dimension, at most 128 KiB each, at most 64 assets per pack. No URLs/absolute paths, parent traversal, symlink escape, SVG or renamed file types.
2. The offline decoder uses the already available Playwright + Chrome tooling; no npm dependency is added. On this Windows setup use `$env:PLAYWRIGHT_MODULE_PATH='C:\Users\Jeremiah\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright'`. If unavailable, preparation fails before activation; installation is not automatic or authorized by this ticket.
3. Run `node scripts/prepare-category-icons.mjs --pack catalog/icon-packs/my-pack-v1/manifest.json`. It checks header/version/IDs/mappings/contained paths, signatures, sizes and actual browser image decode in a fresh nonpersistent about:blank context, without reading personal data. Validated immutable assets are copied under content-addressed `public/icon-packs/`; the single activation module `src/assets/owner-categories.js` embeds category mapping plus asset hashes/dimensions/provenance/permission/coverage report. Category art remains a presentation overlay; saved roadmap data is never read or rewritten.
4. Run the same command with `--check` for reproducibility. Reload source/rebuild into a NEW separate output directory for review. Export JSON before changing your working package; backups retain references, not image bytes.

For a safe candidate without activating it, add `--output evidence/my-review/owner-categories.js` after creating `evidence/my-review`. Output must remain inside the checkout. Review that generated report before intentionally activating the desired pack. Switching packs replaces the whole Owner mapping; omitted categories revert to pinned defaults/fallback. It does not merge separate Owner packs.

All validation/decoding and existing-destination comparisons finish before writing. Different bytes at an existing immutable asset path reject. Activation uses a candidate file then one atomic rename; a failed activation keeps the old mapping/report. New unused files/candidate artifacts can remain after a filesystem failure; no destructive cleanup is performed. Previously working outputs are not overwritten on invalid input, and unused assets are not removed.

## Original sample and current gaps

`sample-v1/manifest.json` plus `sample-v1/icons/neutral.png` is a project-original 32px diamond sample, not Jagex artwork and not a substitute for Inventory/Diary. It maps Custom only. Safe example:

`node scripts/prepare-category-icons.mjs --pack catalog/icon-packs/sample-v1/manifest.json --output evidence/p5-004-preflight-2026-10-27/sample-owner-categories.js`

Repeat with `--check`. The live source activation remains empty by default. Owner has not supplied suitable Inventory/Diary files; these two genuine-symbol gaps remain explicitly disclosed. Current five genuine pinned symbols and original fallback remain available. Disposable browser fixtures use original test PNG/WebP mappings to verify both missing categories can be supplied, without claiming those fixtures are authentic category symbols.
