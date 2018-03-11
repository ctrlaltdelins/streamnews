#!/usr/bin/ruby
require 'yaml'
require 'feedjira'
require 'sqlite3'
require 'colorize'
require 'net/http'
Feedjira.logger.level = Logger::FATAL
FILECONF = "#{Dir.home}/.newstream.conf"
$conf

def help()
  puts "usage:"
  puts "  newstream   command   [options]"
  puts "              -         -           stream the news"
  puts "              add       name url    adds a source"
  puts "              list      -           list the sources"
  puts "              remove    name        remove a source"
  exit false
end

def checkFileConf()
  unless File.file?(FILECONF)
    puts "you haven't add any sources yet."
    help()
    exit false
  end
  if File.file?(FILECONF)
    return YAML::load_file(FILECONF)
  end
end
  
def add(options)
  if options.length == 2
    if File.file?(FILECONF)
      $conf = YAML::load_file(FILECONF)
      $conf[:sources].push({name: options[0], url: options[1]})
      File.open(FILECONF, 'w') { |f| f.puts $conf.to_yaml }
      puts "#{options[0]} added"
      exit 0
    else
      $conf = {sources: [{name: options[0], url: options[1]}]}
      File.open(FILECONF, 'w') { |f| f.puts $conf.to_yaml }
      puts "#{options[0]} added"
      exit 0
    end
  else
    help()
  end
end

def remove(options)
  if options.length == 1
    $conf = checkFileConf()
    for source in $conf[:sources]
      if source[:name] == options[0]
        $conf[:sources].delete(source) 
        puts "#{options[0]} removed"
      end
    end
    File.open(FILECONF, 'w') { |f| f.puts $conf.to_yaml }
    exit 0
  else
    help()
  end
end

def list()
  $conf = checkFileConf()
  $conf[:sources].each { |source| puts source[:name] + ": " + source[:url] }
end

def stream()

  puts " _____ _____ _ _ _ _____ _____ _____ _____ _____ _____ ".yellow
  puts "|   | |   __| | | |   __|_   _| __  |   __|  _  |     |".green
  puts "| | | |   __| | | |__   | | | |    -|   __|     | | | |".cyan
  puts "|_|___|_____|_____|_____| |_| |__|__|_____|__|__|_|_|_|".magenta
  puts ""

  $conf = checkFileConf()

  begin
    db = SQLite3::Database.new ":memory:"
    db.execute "CREATE TABLE IF NOT EXISTS news(ID INTEGER PRIMARY KEY, SOURCE TEXT, TITLE TEXT, DATETIME DATETIME)"

    for source in $conf[:sources]
      uri = URI(source[:url])
      xml = Net::HTTP.get_response(uri)
      # feed = Feedjira::Feed.fetch_and_parse source[:url]
      # feed.entries.each { |item|
      #   stm = db.prepare "INSERT INTO news (SOURCE, TITLE, DATETIME) VALUES (?, ?, ?)"
      #   stm.bind_param 1, source[:name]
      #   stm.bind_param 2, item.title
      #   stm.bind_param 3, item.published.utc.strftime('%Y-%m-%d %H:%M:%S')
      #   rs = stm.execute
      #   stm.close if stm
      # }
    end

    stm = db.prepare "SELECT DATETIME, SOURCE, TITLE FROM news ORDER BY DATETIME" 
    rs = stm.execute 
    
    rs.each do |row|
      d = Time.parse(row[0])
      puts "#{d.strftime('%H:%M:%S')} [#{row[1]}] #{row[2]}" 
    end

  rescue SQLite3::Exception => e 
    puts "Database error"
    puts e
      
  ensure
    stm.close if stm
    db.close if db
  end

end

cmd, *options = ARGV

case cmd
when "add"
  add(options)
when "remove", "rm"
  remove(options)
when "list", "ls"
  list()
when nil
  stream()
else
  help()
end