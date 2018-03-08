# Neo-Chart
Open-source Javascript project to create chart graph.

### License
MIT License. Use this library free.

### Import to website
Just add next code to HEAD tag on your site.
``` html
<script type="text/javascript" src="neo-chart.min.js"></script>
```

If you want to use with Github CDN, use this code.
``` html
<script type="text/javascript" src="https://wolfgangkurz.github.io/Neo-Chart/neo-chart.min.js"></script>
```

You don't need any CSS files to use this library.

### Usage
#### Parameters on canvas property
| Parameter               | Description                      | Value type                | Defult value  |
| ---------------------- | ----------------------------- | ----------------------- | -------------- |
| data-title                | Title text to display            | String                      | (empty)        |
| data-background     | Background color              | String, Color             | #ffffff          |
| data-vert-grid-color  | Vertical grid line color       | String, Color             | #e8e8e8       |
| data-horz-grid-color | Horizontal grid line color   | String, Color             | #b6b6b6      |
| data-baseline-color   | Left and Bottom line color | String, Color             | #b6b6b6      |
| data-style                | Style of graph                 | enum Array [bar, line] | [line]           |
| data-x-prefix            | X axis text prefix              | String                      | (empty)        |
| data-x-postfix          | X axis text postfix             | String                      | (empty)        |
| data-y-prefix            | Y axis text prefix              | String                      | (empty)        |
| data-y-postfix          | Y axis text postfix             | String                      | (empty)        |
| data-bar-y-prefix      | Y axis text prefix (For bar)  | String                      | (empty)        |
| data-bar-y-postfix    | Y axis text postfix (For bar) | String                      | (empty)        |
| data-min                | Minimum display Y value   | Integer                     | 0                |
| data-max                | Maximum display Y value  | Integer                     | 100             |
| data-bars                | Bar count                        | Integer                     | 1                |
| data-split                | Vertical split count           | Integer                      | Height / 36  |
| data-target              | Graph data class-name      | String                      | (empty)        |

### Example for starters
Please see [/example/example.html](https://github.com/WolfgangKurz/Neo-Chart/blob/master/example/example.html) page.

### Screenshot
![Example screenshot](https://raw.githubusercontent.com/WolfgangKurz/Neo-Chart/master/example/example.PNG)
(Example screenshot)
