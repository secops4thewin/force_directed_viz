# Force Directed App For Splunk #
This app was created to allow IT Operations administrators and the security team to visualize there networks, attack paths inside an environment, connections between objects.  The limits are endless.  Some of the features that are supported in this app are

- Customisation to Attract and Repel Forces
- Selectable Dark and White Theme
- Automatic Grouping and colouring of nodes
- Customisation to collision forces to avoid overlapping

Also some great references for D3 below.

https://roshansanthosh.wordpress.com/2016/09/25/forces-in-d3-js-v4/
https://github.com/d3/d3-force/blob/master/README.md

### Installation Instructions

1. Download the app and unzip to $SPLUNK_HOME/etc/apps on your Search Head
2. Restart Splunk
3. Generate a search that has a 'source', 'target' and optionally a count. For example

- index=firewall action=allowed | stats count by src_ip, dest_ip | table src_ip, dest_ip, count

### Bugs
Known - Arrows not working in IE11.  This is a bug in IE not the code.  To make the code flexible to exclude and include arrows I could not make this work.

Please report any other bugs to this page.  I accept pull requests.

### Feature Requests


### Tested on
**Mac**
- Safari Version 11.0 
- Chrome Version 61.0.X (Official Build) (64-bit)
- Firefox 64.0
**Windows Server 2012**
- Internet Explorer 11
