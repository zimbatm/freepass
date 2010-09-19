# Needs "closure-compiler" gem
begin
  require 'closure-compiler'
rescue LoadError
  puts "*** install the closure-compiler gem"
  exit 1
end

task :default => :compile
task :compile => ["src/bookmarklet.min.js"]

$cc = Closure::Compiler.new(:compilation_level => 'ADVANCED_OPTIMIZATIONS')

file "src/bookmarklet.min.js" => "src/bookmarklet.js" do |t|
  File.open(t.name, 'w') do |f|
    f.write $cc.compile(concat(t.prerequisites))
  end
  puts "*** #{t.name} generated"
end

def concat(*files)
  files.flatten.map{|f| File.read(f)}.join
end
