
clean:
	rm -rv ./.cache/ || true
	rm -rv ./dist/ || true
	rm -rv ./node_modules/ || true

install:
	yarn

build: install
	yarn run build

run: install
	yarn run start

serve: install
	yarn run serve

test: install
	yarn run test