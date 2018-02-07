#!/usr/lib/ruby
 
require 'cgi'
require 'open3'

cgi = CGI.new
values = cgi["q"]

print "Content-type: text/html; \n\n"

#print "input:" + values + "<br>"
out, err, status = Open3.capture3("./echo.out", stdin_data: "#{values}" )
#print "output:" + out + "<br>"
print out

