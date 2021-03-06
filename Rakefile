

task :default => :dev

#### Global directives ####

desc "Minification"
task :min => ["_build/freepass.min.js", "_build/freepass.min.css", "_build/freepass.min.html"]

desc "Bundle in one file"
task :bundle => "_build/freepass.bundle.html"

desc "Minify, then bundle"
task "min+bundle" => "_build/freepass.min.bundle.html"

desc "Development build"
task :dev => ["_build/freepass.html", "_build/freepass.css", "_build/freepass.js"]

desc "Generate index file with manifest"
task "release" => "_build/index.html"

#### Constants ####

PUBLICSUFFIX_LIB=File.expand_path('../publicsuffix.js/lib')

#### File tasks ####

directory "_build"

file "_build/index.html" => "_build/freepass.min.bundle.html" do
  cp "_build/freepass.min.bundle.html", "_build/index.html"
  sh "tools/html-manifest", "_build/index.html"
end

# Build one big file with all commonjs deps in a wrapper
# TODO: resolve dependencies with static analysis
file "_build/freepass.js" => ["lib/biginteger.js", "lib/freepass.js", "lib/freepass/gui.js",
   "lib/jquery.js", "lib/jquery/hashmask.js", "lib/jquery/sparklite.js", "lib/sha1.js"] do |t|
  
  deps = t.prerequisites.select do |fname|
    File.file?(fname) && fname =~ /lib\//
  end
  
  # TODO: use node to resolve the dependencies
  deps << PUBLICSUFFIX_LIB + '/publicsuffix.js'
  deps << PUBLICSUFFIX_LIB + '/publicsuffix-list.js'

  mkdir_p "_build"
  sh "tools/js-wrap", t.name, 'freepass/gui', *deps
end

file "_build/freepass.min.js" => "_build/freepass.js" do |t|
  sh "tools/js-min", "-e", "yui", t.prerequisites.first, t.name
end

file "_build/freepass.css" => "src/freepass.css" do
  cp "src/freepass.css", "_build/freepass.css"
end

file "_build/freepass.min.css" => "_build/freepass.css" do |t|
  sh "tools/css-min", t.prerequisites.first, t.name
end

file "_build/freepass.html" => ["_build", "src/freepass.html", "_build/freepass.js", "_build/freepass.css"] do
  cp "src/freepass.html", "_build/freepass.html"
end

file "_build/freepass.min.html" => ["_build/freepass.html", "_build/freepass.min.js", "_build/freepass.min.css"] do |t|
  # TODO: compress the html
  File.open(t.name, 'w') do |f|
    f.write File.read(t.prerequisites.first).sub('freepass.js', 'freepass.min.js').sub('freepass.css', 'freepass.min.css')
  end
  $stderr.puts "FAKE: tools/html-min #{t.prerequisites.first} #{t.name}"
end

# TODO: resolve dependencies with static analysis
# TODO: should include the bookmarklet
file "_build/freepass.bundle.html" => ["_build/freepass.html", "_build/freepass.js", "_build/freepass.css"] do |t| 
  # One file to rule them all
  sh "tools/html-bundle", t.prerequisites.first, t.name
end

file "_build/freepass.min.bundle.html" => "_build/freepass.min.html" do |t|
  sh "tools/html-bundle", t.prerequisites.first, t.name
end

desc "Removes built files"
task :clean do
  rm_rf "_build"
end
