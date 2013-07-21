sources = css/arguable.css index.html

all: $(sources)

watch: all
	@inotifywait -q -m -e modify arguable/pages css | while read line; \
		do \
		if echo $$line | grep '.\(less\|html\)$$'; then \
			make --no-print-directory all; \
	fi \
	done;

css/%.css: css/%.less
	node_modules/.bin/lessc $< > $@ || rm -f $@

%.html: arguable/pages/%.html
	node node_modules/edify/edify.bin.js $< $@

clean:
	rm $(sources)
