DENO_DIR := $(shell deno info | grep DENO_DIR | cut -d " " -f 3)

ifeq ($(VERSION),)
  URL := ""
else
	URL := "--release=https://github.com/skanehira/deno-clippy/releases/download/$(VERSION)/"
endif

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
build:
	@deno_bindgen $(URL)

.PHONY: deno-test
deno-test: clean build
	@deno test -A --unstable

.PHONY: ffi-test
ffi-test:
	@cargo test -- --nocapture

.PHONY: test
test:
	@echo "######## deno testing... ########"
	@make deno-test
	@echo "######## ffi testing... ########"
	@make ffi-test

.PHONY: deps
deps:
	@deno run -A https://deno.land/x/udd@0.7.3/main.ts deps.ts

.PHONY: check
check:
	@cargo check

.PHONY: lint
lint:
	@cargo clippy
