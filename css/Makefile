CLEANCSS=${HOME}/node_modules/clean-css/bin/cleancss

default: css

css:
	lessc combined.less > combined.css && ${CLEANCSS} combined.css > combined.min.css

