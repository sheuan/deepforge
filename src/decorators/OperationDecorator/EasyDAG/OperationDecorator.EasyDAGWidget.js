/*globals define, _*/
/*jshint browser: true, camelcase: false*/

/**
 * @author brollb / https://github.com/brollb
 */

define([
    'decorators/EllipseDecorator/EasyDAG/EllipseDecorator.EasyDAGWidget',
    'css!./OperationDecorator.EasyDAGWidget.css'
], function (
    DecoratorBase
) {

    'use strict';

    var OperationDecorator,
        NAME_MARGIN = 25,
        DECORATOR_ID = 'OperationDecorator';

    // Operation nodes need to be able to...
    //     - show their ports
    //     - highlight ports
    //     - unhighlight ports
    //     - report the location of specific ports
    OperationDecorator = function (options) {
        options.color = options.color || '#78909c';
        DecoratorBase.call(this, options);

        this.id = this._node.id;
        this.$ports = this.$el.append('g')
            .attr('id', 'ports');
    };

    _.extend(OperationDecorator.prototype, DecoratorBase.prototype);

    OperationDecorator.prototype.DECORATOR_ID = DECORATOR_ID;
    OperationDecorator.prototype.PORT_COLOR = {
        OPEN: '#90caf9',
        OCCUPIED: '#e57373'
    };

    OperationDecorator.prototype.condense = function() {
        var path,
            width,
            rx,
            ry;

        width = Math.max(this.nameWidth + 2 * NAME_MARGIN, this.dense.width);
        rx = width/2;
        ry = this.dense.height/2;

        path = [
            `M${-rx},${-ry}`,
            `l ${width} 0`,
            `l 0 ${this.dense.height}`,
            `l -${width} 0`,
            `l 0 -${this.dense.height}`
        ].join(' ');


        this.$body
            .attr('d', path);

        // Clear the attributes
        this.$attributes.remove();
        this.$attributes = this.$el.append('g')
            .attr('fill', '#222222');

        this.height = this.dense.height;
        this.width = width;

        this.$name.attr('y', '0');

        this.$el
            .attr('transform', `translate(${this.width/2}, ${this.height/2})`);
        this.expanded = false;
        this.onResize();
    };

    OperationDecorator.prototype.showPorts = function(ids, areInputs) {
        var allPorts = areInputs ? this._node.inputs : this._node.outputs,
            ports = ids ? allPorts.filter(port => ids.indexOf(port.id) > -1) : allPorts,
            x = -this.width/2,
            dx = this.width/(ports.length+1),
            y = (this.height/2);

        if (areInputs) {
            y *= -1;
        }

        ports.forEach(port => {
            x += dx;
            this.renderPort(port, x, y, areInputs);
        });
    };

    OperationDecorator.prototype.renderPort = function(port, x, y, isInput) {
        var color = this.PORT_COLOR.OPEN,
            portIcon = this.$ports.append('g');

        // If the port is incoming and occupied, render it differently
        if (isInput && port.connection) {
            color = this.PORT_COLOR.OCCUPIED;
        }

        portIcon.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 10)
            .attr('fill', color);
            
        portIcon.append('text')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('fill', 'black')
                .text(port.name[0]);

        portIcon.on('click', this.onPortClick.bind(this, this.id, port.id, !isInput));

        // Add tooltip with whole name
        // TODO
    };

    OperationDecorator.prototype.hidePorts = function() {
        this.logger.info(`hiding ports for ${this.name} (${this.id})`);
        this.$ports.remove();
        this.$ports = this.$el.append('g')
            .attr('id', 'ports');
    };

    OperationDecorator.prototype.getPortLocation = function(id, isInput) {
        // Report location of given port
        var ports = isInput ? this._node.inputs : this._node.outputs,
            i = ports.length-1,
            y;

        while (i >= 0 && ports[i].id !== id) {
            i--;
        }
        if (i !== -1) {
            i += 1;
            y = (this.height/2);
            return {
                x: i * this.width/(ports.length+1),
                y: isInput ? y * -1 : y
            };
        }
        return null;
    };

    OperationDecorator.prototype.onPortClick = function() {
        // Overridden in the widget
    };

    OperationDecorator.prototype.getDisplayName = function() {
        return this._node.name;
    };

    return OperationDecorator;
});
