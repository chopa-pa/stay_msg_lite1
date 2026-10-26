1. **[P1] Every save overwrites unrelated reservations and resurrects deletions.** [index.html:3794–3801](</Users/chopa_lee/Library/CloudStorage/GoogleDrive-lottopet@gmail.com/내 드라이브/스테이솔숲/90_참고/2026-04-20_스테이메시지-앱자료/stay_msg_lite1/index.html:3794>).
   PC updates reservation A; phone edits B before polling. Phone upserts its stale A alongside B, reverting PC’s change. Deleted reservations reappear; bot cancellations become `confirmed` through `resToRow`. Whole-object settings writes have equivalent conflicts, and overlapping requests can finish backward.
   **Fix:** Send explicit insert/update/delete mutations only. Use version-checked updates, persistent cancellation tombstones, and serialized writes. Reject conflicts instead of silently overwriting.

2. **[P1] Pull permanently discards pending local changes.** [index.html:3782–3795](</Users/chopa_lee/Library/CloudStorage/GoogleDrive-lottopet@gmail.com/내 드라이브/스테이솔숲/90_참고/2026-04-20_스테이메시지-앱자료/stay_msg_lite1/index.html:3782>).
   Saving while `sbPull` awaits responses updates localStorage, but `sbSyncing` makes the push return immediately. Pull then replaces that saved reservation with its earlier snapshot. Offline writes likewise receive no retry; the first successful pull erases them. Pull can also race an already-running push.
   **Fix:** Persist mutations in an outbox before reporting save success. Never replace dirty records with fetched snapshots. Coordinate reads/writes and replay pending mutations with conflict checks after reconnection.

3. **[P1] Wrappers miss the actual room/settings save paths.** [index.html:3822](</Users/chopa_lee/Library/CloudStorage/GoogleDrive-lottopet@gmail.com/내 드라이브/스테이솔숲/90_참고/2026-04-20_스테이메시지-앱자료/stay_msg_lite1/index.html:3822>).
   `saveRoomSingle` at 3092, `addRoom` at 3122, `saveRoom` at 3137, `deleteRoom` at 3145, settings reset, and `deletePeriod`’s settings cleanup write storage directly. None invokes wrapped `saveSettings`. A saved door code or room rate therefore remains local and reverts on polling, potentially producing wrong SMS instructions or prices.
   **Fix:** Route these mutations through one settings persistence function that queues server writes. Keep hydration/migration writes separate.

4. **[P1] Background refresh destroys unsaved settings drafts.** [index.html:3756–3757](</Users/chopa_lee/Library/CloudStorage/GoogleDrive-lottopet@gmail.com/내 드라이브/스테이솔숲/90_참고/2026-04-20_스테이메시지-앱자료/stay_msg_lite1/index.html:3756>).
   Every poll invokes `fillSettingsFields`, which overwrites profile inputs and rebuilds room editors. Typing an account number, door code, or rate across the polling boundary loses the draft. `buildTplSelect` also restores positional template keys; another device deleting/reordering custom templates can change the selected SMS body.
   **Fix:** Track dirty forms and preserve their drafts. Defer conflicting UI hydration, use stable template IDs, and require review before replacing an active SMS draft.

5. **[P1] First-run initialization is neither exclusive nor atomic.** [index.html:3771–3775](</Users/chopa_lee/Library/CloudStorage/GoogleDrive-lottopet@gmail.com/내 드라이브/스테이솔숲/90_참고/2026-04-20_스테이메시지-앱자료/stay_msg_lite1/index.html:3771>).
   Two devices can both observe “empty” and later upload conflicting snapshots. Separately, `sbPushAll` writes settings first: if reservations fail afterward, the next pull sees a nonempty server, skips initialization, and replaces local reservations with an empty list. The emptiness test also ignores messages and cancelled reservations.
   **Fix:** Use a transactional initialization RPC with an exclusive initialization marker, checked when committing. Upload the complete snapshot atomically and preserve local data until acknowledgment.

6. **[P1] Failed writes are acknowledged as success; failed deletions are forgotten.** [index.html:3797–3818](</Users/chopa_lee/Library/CloudStorage/GoogleDrive-lottopet@gmail.com/내 드라이브/스테이솔숲/90_참고/2026-04-20_스테이메시지-앱자료/stay_msg_lite1/index.html:3797>).
   Delete responses are ignored, then `sbResIds`/`sbHistIds` advance despite failure. Deleted reservations return on the next pull. Deletes also proceed after failed upserts. Other push functions swallow errors, so initialization/import displays success even when every write failed.
   **Fix:** Propagate structured failures, check every delete result, and acknowledge only completed mutations. Preserve failed operations for retry; show server success only after all required writes succeed.

7. **[P1] Transient authentication failure can permanently disable writes until reload.** [index.html:3748–3754](</Users/chopa_lee/Library/CloudStorage/GoogleDrive-lottopet@gmail.com/내 드라이브/스테이솔숲/90_참고/2026-04-20_스테이메시지-앱자료/stay_msg_lite1/index.html:3748>).
   `getUser()` requires a network request. If it fails during startup, `sbUserEmail` becomes empty, yet login closes. After reconnection, pulls can resume successfully while every push still returns because that email is never refreshed. Session loss after failed token refresh likewise has no UI handler.
   **Fix:** Handle authentication errors explicitly and maintain session state through `onAuthStateChange`. On session loss, preserve queued edits and request login; on recovery, resume writes before replacing dirty cache. [getUser documentation](https://supabase.com/docs/reference/javascript/auth-getuser), [auth event documentation](https://supabase.com/docs/reference/javascript/auth-onauthstatechange).

8. **[P2] Local history truncation deletes shared server history.** [index.html:3807–3808](</Users/chopa_lee/Library/CloudStorage/GoogleDrive-lottopet@gmail.com/내 드라이브/스테이솔숲/90_참고/2026-04-20_스테이메시지-앱자료/stay_msg_lite1/index.html:3807>).
   After pulling 200 messages, adding one invokes the existing 200-entry trim. The evicted message remains in `sbHistIds`, so synchronization interprets cache eviction as an intentional server deletion. Conversely, “clear all” deletes only loaded IDs; older server messages return.
   **Fix:** Separate cache eviction from explicit deletion. Implement server-wide history clearing explicitly if that is the intended command.

9. **[P2] History round-trips rewrite bot provenance and delivery status.** [index.html:3734–3735](</Users/chopa_lee/Library/CloudStorage/GoogleDrive-lottopet@gmail.com/내 드라이브/스테이솔숲/90_참고/2026-04-20_스테이메시지-앱자료/stay_msg_lite1/index.html:3734>).
   `rowToHist` drops `sent_by` and `status`; `histToRow` forces `app` and `sent`. Once bot/failed/preview records exist, saving any history entry rewrites all loaded records as successfully sent by the app. Opening the native SMS composer also does not establish delivery.
   **Fix:** Preserve server metadata, insert only newly created history records, and distinguish composer launches from confirmed sends.

10. **[P2] Concurrent bookings bypass the client-only conflict check.** [supabase/schema.sql:7–24](</Users/chopa_lee/Library/CloudStorage/GoogleDrive-lottopet@gmail.com/내 드라이브/스테이솔숲/90_참고/2026-04-20_스테이메시지-앱자료/stay_msg_lite1/supabase/schema.sql:7>).
    PC and phone can both see availability and insert different IDs for the same room/dates. Schema accepts both; `source_id` uniqueness does not prevent this.
    **Fix:** Enforce valid date order and nonoverlapping confirmed stays in PostgreSQL, using a canonical room identity and checkout-exclusive date ranges. Surface constraint failures as booking conflicts.

Six failure sequences reproduced using extracted sync functions and mocked storage/server responses. No repository changes or live database writes.
exit 0
