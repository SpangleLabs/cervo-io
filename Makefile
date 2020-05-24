
clean:
	$(MAKE) clean -C common-lib
	$(MAKE) clean -C backend-api
	$(MAKE) clean -C common-ui-lib
	$(MAKE) clean -C admin-ui
	$(MAKE) clean -C frontend-ui

install:
	$(MAKE) install -C backend-api
	$(MAKE) install -C common-lib
	$(MAKE) install -C common-ui-lib
	$(MAKE) install -C frontend-ui

build: install
	$(MAKE) build -C common-lib
	$(MAKE) build -C common-ui-lib
	$(MAKE) build -C frontend-ui

serve:
	echo "Please use either 'make serve-api' or 'make serve-ui'"

serve-api: install
	$(MAKE) serve -C backend-api

serve-ui: install
	$(MAKE) serve -C frontend-ui

test:
	$(MAKE) test -C common-lib
	$(MAKE) test -C common-ui-lib
	$(MAKE) test -C frontend-ui