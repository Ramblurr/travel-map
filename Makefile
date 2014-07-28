default: css

css:
	/usr/bin/csscombine -m css/combined.css > css/combined.min.css

.PHONY: css
