![shake and bake](http://optimizing-javascript-talk.herokuapp.com/lib/shake-and-bake.gif)

# 🏁🏎talladega

remember jsperf.com? it's gone now, for some reason. probably best not to ask questions.
this works instead. see [./examples](./examples) for usage examples.

### um
![talladega](https://cloud.githubusercontent.com/assets/1643758/18941086/99dfa450-85d3-11e6-9619-d6aa560ccfff.gif)

### why is all the code in strings man
in order to prevent javascript VM deopts that would make your already-dubious
microbenchmarks useless, the underlying [benchmark.js](https://benchmarkjs.com/) engine
stringifies your code and modifies it anwyay. i chose this API so it would be extra clear
that weird things are happening to your code. don't you forget it.
