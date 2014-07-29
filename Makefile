all: css

.PHONY: css

css:
	$(MAKE) -C css

deploy:
	git push && git checkout gh-pages && git push && git checkout master
