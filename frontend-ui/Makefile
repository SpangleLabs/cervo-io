
clean:
	rm -rv ./.cache/ || true
	rm -rv ./dist/ || true
	rm -rv ./node_modules/ || true

install:
	yarn

build: install
	npm run build

serve: install
	npm run serve

test: install
	npm run test