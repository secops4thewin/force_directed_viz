# Force Directed App For Splunk #
This app was created to allow IT Operations administrators and the security team to visualize there networks, attack paths inside an environment, connections between objects.  The limits are endless.  Some of the features that are supported in this app are

- Customisation to Attract and Repel Forces
- Selectable Dark and White Theme
- Automatic Grouping and colouring of nodes
- Customisation to collision forces to avoid overlapping

Also some great references for D3 below.

https://roshansanthosh.wordpress.com/2016/09/25/forces-in-d3-js-v4/
https://github.com/d3/d3-force/blob/master/README.md
https://vega.github.io/vega/docs/transforms/force/

### Installation Instructions

1. Download the app and unzip to $SPLUNK_HOME/etc/apps on your Search Head
2. Restart Splunk
3. Generate a search that has a 'source', 'target' and optionally a count. 

### Search Examples

- index=firewall action=allowed | stats count by src_ip, dest_ip | table src_ip, dest_ip, count
- sourcetype=access_combined | stats count by src_ip,uri_path

### Configuration Options

#### Format
1. Theme Color - Changes background image color
2. Arrows - Enables direction arrows in force directed visualization

#### Force Configuration
1. Attract Force Strength - Strength of Attracting forces. 
2. Attract Distance Max - The maximum distance over which attraction force acts. If two nodes exceed distanceMax, they will not exert forces on each other.
3. Attract Distance Min - The minimum distance over which attraction force acts. If two nodes are close than distanceMin, the exerted forces will be as if they are distanceMin apart.
4. Repel Force Strength - Strength of Repelling force
5. Repel Distance Max - The maximum distance over which repel force acts. If two nodes exceed distanceMax, they will not exert forces on each other.
6. Repel Distance Min - The minimum distance over which repel force acts. If two nodes exceed distanceMax, they will not exert forces on each other.

#### Collision Configuration
1. Collision Strength - How strict collision mechanism is
2. Collision Radius - The radius between a center of each node that can't be overlapped with each other
3. Force Collide - Superfluous setting
4. Collision Iterations - The number of times to 

#### Link Configuration
1. Link Highlight Length - From the highlighted node, how many children links will be highlighted
2. Line Color Enabled - Should the links be colored dependant on the bin ranges
3. Color Range X - Bin from 0-Range1, Range1-Range2, Range3-Range4, etc
2. Stroke Width - Same as color range but changing the width of the link

#### Node Configuration
1. Node Pixel Smallest Size - Dynamic sizer that has a scale rating, this is the lower limit (Smallest sized node)
1. Node Pixel Largest Size - Dynamic sizer that has a scale rating, this is the upper limit (Largest sized node)

### Bugs
Known - Arrows not working in IE11.  This is a bug in IE not the code.  To make the code flexible to exclude and include arrows I could not make this work.

Please report any other bugs to this page.  I accept pull requests.

### Feature Requests
Post any feature requests as issues and I will look around to them.  My only feedback prior to making feature requests is ensuring that the feature does not reduce the flexibility of the app :).

### Tested on
**Mac**
- Safari Version 11.0 
- Chrome Version 61.0.X (Official Build) (64-bit)
- Firefox 64.0

**Windows Server 2012**
- Internet Explorer 11

### Release Notes
***Version 3.0.0***
- Added Dynamic Node Sizing
- Added ability to pin and unpin nodes
- Added support for later versions of Splunk
- Moved Menu Items around
- Added Stroke width in Link Configuration
- Probably something else I forgot.

### License
This app uses D3 with the following license conditions
https://github.com/d3/d3/blob/master/LICENSE
