![shake and bake](http://optimizing-javascript-talk.herokuapp.com/lib/shake-and-bake.gif)

# 🏁🏎talladega

Remember jsperf.com? It's gone now, for some reason. Probably best not to ask questions.
This works instead (for v8, anyway). See [./examples](./examples) for usage examples. But remember: microbenchmarks are stupid. This is mostly useful to show you how nonintuitive your results can be.

### it's all like
![talladega](https://cloud.githubusercontent.com/assets/1643758/18957810/1ceb9686-8626-11e6-9c65-d58170f8312c.gif)

### usage
It works a little like a simple unit test utility, like tape. Create a file and require `talladega`.
```js
const talladega = require('talladega');
```

You need to name your benchmark:
```js
const name = 'String concatenation vs. array join';
```

Then, declare an array of *specs*. Each spec is an object representing one of your cases to be benchmarked. `talladega` will compare the performance of each spec and display the graph side by side. A spec object must at least have a `name` labeling it and a `fn` string (or function) containing the actual code to be measured. In fact, it is exactly the object you pass to a [Benchmark.js](https://benchmarkjs.com/) constructor! Any of the [options available to Benchmark instances](https://benchmarkjs.com/docs#options) can also be used in a spec object.

```js
const specs = [
	{
		name: 'array join',
		fn: '["Shake ", "and ", "bake!"].join("")'
	},
	{
		name: 'string concat',
		fn: '"Shake " + "and "+ "bake!"'
	}
]
```

##### ⚠️ However...

 - unlike in Benchmark.js, you must always declare a `name` and a `fn` (you cannot pass a function directly)
 - all functions are going to be serialized, because the spec object will be passed to a child process so that each spec can be benchmarked on a separate processor core. **Be careful with this**: it means that you can't use code from the outer context in any of your spec functions or methods.

Finally, the optional third argument to `talladega` is an object of options.

 - `expectedTime`: A number of milliseconds to wait before the UI starts to complain that it's taking a while. Default `6000`.
 - `color`: A string representing a terminal color, like `green` or whatever. Default `cyan`.

Then, call `talladega(name, specs options)`. The script will take over your terminal window with a visual display of results.

Obviously you can do this all shorter:
```js
require('talladega')('String concatenation vs. array join', [
	{
		name: 'array join',
		fn: '["Shake ", "and ", "bake!"].join("")'
	},
	{
		name: 'string concat',
		fn: '"Shake " + "and "+ "bake!"'
	}
], { color: 'yellow' });
```

but that doesn't make it faster or anything.

### why is all the code in strings, bro
In order to prevent javascript VM deopts that would make your already-dubious
microbenchmarks useless, the underlying [benchmark.js](https://benchmarkjs.com/) engine
stringifies your code and modifies it anwyay. You can declare your `fn`, `setup`, etc as functions if you like syntax highlighting, but it can be misleading, because you might be tempted to use variables from the outer context of your benchmark file in those functions--and that won't work. I chose stringifying for the examples so it would be extra clear that weird things are happening to your code.
