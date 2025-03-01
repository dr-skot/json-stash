# json-stash-async

This is a fork of `json-stash` that adds two async functions, `stashAsync` and `unstashAsync`. These do the same
thing `stash` and `unstash` do, but wrap some of their processing into `setTimeout` calls, so that thread control
is periodically yielded. This allows you to stash particularly large and/or complex objects without freezing the UI.

Use `stashAsync` and `unstashAsync` just as you would `stash` and `unstash`, but `await` the results
(or receive them in the `then()` method).

For more, see the documentation for `json-stash`.
