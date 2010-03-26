
task :default => :compile

# Needs "closure-compiler" gem
task :compile do
  require 'closure-compiler'
  cc = Closure::Compiler.new(:compilation_level => 'ADVANCED_OPTIMIZATIONS')
  File.open('bookmarklet.min.js', 'w') do |f|
    f.write cc.compile(File.open('bookmarklet.js', 'r'))
  end
end

