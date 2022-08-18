DENO_DIR := $(shell deno info | grep DENO_DIR | cut -d " " -f 3)

.PHONY: build
build:
	@rm -rf $(DENO_DIR)/plug/file/*.dylib
	@deno_bindgen

.PHONY: deno-test
deno-test: build
	@deno test -A --unstable

.PHONY: rust-test
rust-test: build
	@cargo test -- --nocapture

.PHONY: deps
deps:
	@deno run -A https://deno.land/x/udd@0.7.3/main.ts deps.ts
