# Needs "closure-compiler" gem
begin
  require 'closure-compiler'
rescue LoadError
  $stderr.puts "*** install the closure-compiler gem"
  exit 1
end

begin
  require 'nokogiri'
rescue LoadError
  $stderr.puts "*** install the nokogiri gem"
  exit 1
end

task :default => :dev

desc "Development build"
task :dev => ["_build/freepass.html", "_build/freepass.css", "_build/freepass.js"]

desc "Production build"
task :prod => "_build/index.html"

$cc = Closure::Compiler.new(:compilation_level => 'ADVANCED_OPTIMIZATIONS')
def concat(*files)
  files.flatten.select{|f|File.file?(f)}.map{|f| File.read(f)}.join
end

directory "_build"

file "_build/bookmarklet.min.js" => ["_build", "src/bookmarklet.js"] do |t|
  File.open(t.name, 'w') do |f|
    f.write $cc.compile(concat(t.prerequisites))
  end
  $stderr.puts "* minimised #{t.name}"
end

file "_build/freepass.js" => ["_build", "src/module.js", "lib/biginteger.js", "lib/freepass.js", "lib/freepass/gui.js",
   "lib/jquery.js", "lib/jquery/hashmask.js", "lib/jquery/sparklite.js", "lib/sha1.js"] do |t|
  
  deps = t.prerequisites.select do |fname|
    File.file?(fname) && fname =~ /lib\//
  end
  
  # Creates a CommonJS environment and include the needed modules
  # NOTE: Wanted to use String#sub, but some \\ characters get stripped
  File.open("_build/freepass.js", 'w') do |f|
    modjs = File.read('src/module.js').split(';;;');
    
    modules = deps.map do |fname|
      "module(\"#{fname.sub(/^lib\//,'').sub(/\.js$/,'')}\", " +
        "function(module, exports, require){" + File.read(fname) + "});"
    end
    
    f.write [modjs[0], modules.join("\n"), modjs[1], 'freepass/gui', modjs[2]].join
  end
  $stderr.puts "* generated #{t.name} from #{deps.join(', ')}" 
end

file "_build/freepass.css" => ["_build", "src/freepass.css"] do
  cp "src/freepass.css", "_build/freepass.css"
end     

file "_build/freepass.html" => ["_build", "src/freepass.html"] do
  cp "src/freepass.html", "_build/freepass.html"
end     

file "_build/index.html" => ["_build/freepass.html", "_build/freepass.js", "_build/freepass.css"] do |t| 
  # One file to rule them all
  sh "tools/html-bundle #{t.prerequisites.first} #{t.name}"
  sh "tools/html-manifest #{t.name}"
end

desc "Removes built files"
task :clean do
  rm_rf "_build"
end
