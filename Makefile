DENO_DIR := $(shell deno info | grep DENO_DIR | cut -d " " -f 3)

ifeq ($(DENO_OS),)
  DENO_OS := $(shell deno eval "console.log(Deno.build.os)")
endif

ifeq ($(DENO_OS),windows)
  LIB_EXT := dll
endif
ifeq ($(DENO_OS),linux)
  LIB_EXT := so
endif
ifeq ($(DENO_OS),darwin)
  LIB_EXT := dylib
endif

.PHONY: clean
clean:
	@rm -f $(DENO_DIR)/plug/file/*.$(LIB_EXT)

.PHONY: build
build: clean
	@deno_bindgen --release

.PHONY: deno-test
deno-test: build
	@deno test -A --unstable

.PHONY: rust-test
rust-test: build
	@cargo test -- --nocapture

.PHONY: deps
deps:
	@deno run -A https://deno.land/x/udd@0.7.3/main.ts deps.ts
