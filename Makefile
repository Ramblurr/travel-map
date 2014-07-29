all: css

.PHONY: css

css:
	$(MAKE) -C css

deploy:
	git push && git checkout gh-pages && git rebase master && git push && git checkout master
