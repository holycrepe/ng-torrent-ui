"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var apEMP;
(function (apEMP) {
    var Classes;
    (function (Classes) {
        var Counters;
        (function (Counters) {
            var Range = function () {
                function Range(start, obj) {
                    _classCallCheck(this, Range);

                    this.start = start;
                    this.length = Range.getLength(obj);
                }

                _createClass(Range, [{
                    key: "end",
                    get: function get() {
                        return this.start + this.length;
                    }
                }], [{
                    key: "getLength",
                    value: function getLength(obj) {
                        if (typeof obj === "number") {
                            return obj;
                        } else {
                            return obj.length;
                        }
                    }
                }]);

                return Range;
            }();

            Counters.Range = Range;

            var LoopCounter = function () {
                function LoopCounter(obj) {
                    _classCallCheck(this, LoopCounter);

                    this._index = 0;
                    this.length = Range.getLength(obj);
                    this._index = 0;
                }

                _createClass(LoopCounter, [{
                    key: "step",
                    value: function step() {
                        this._index++;
                    }
                }, {
                    key: "index",
                    get: function get() {
                        return this._index;
                    }
                }, {
                    key: "current",
                    get: function get() {
                        return this._index + 1;
                    }
                }, {
                    key: "active",
                    get: function get() {
                        return this._index < this.length;
                    }
                }], [{
                    key: "create",
                    value: function create(obj) {
                        return new LoopCounter(obj);
                    }
                }]);

                return LoopCounter;
            }();

            Counters.LoopCounter = LoopCounter;
        })(Counters = Classes.Counters || (Classes.Counters = {}));
    })(Classes = apEMP.Classes || (apEMP.Classes = {}));
})(apEMP || (apEMP = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkV4ZWN1dGlvbi5Db3VudGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFVLEtBQVY7QUFBQSxDQUFBLFVBQVUsS0FBVixFQUFlO0FBQUMsUUFBQSxPQUFBLENBQUQ7QUFBQyxLQUFBLFVBQUEsT0FBQSxFQUFPO0FBQUMsWUFBQSxRQUFBLENBQUQ7QUFBQyxTQUFBLFVBQUEsUUFBQSxFQUFTO2dCQUM3QjtBQUVJLHlCQUZKLEtBRUksQ0FBbUIsS0FBbkIsRUFBa0MsR0FBbEMsRUFBbUQ7MENBRnZELE9BRXVEOztBQUFoQyx5QkFBQSxLQUFBLEdBQUEsS0FBQSxDQUFnQztBQUMvQyx5QkFBSyxNQUFMLEdBQWMsTUFBTSxTQUFOLENBQWdCLEdBQWhCLENBQWQsQ0FEK0M7aUJBQW5EOzs2QkFGSjs7d0NBTVc7QUFDSCwrQkFBTyxLQUFLLEtBQUwsR0FBYSxLQUFLLE1BQUwsQ0FEakI7Ozs7OENBR2lCLEtBQW1CO0FBQ3ZDLDRCQUFJLE9BQU8sR0FBUCxLQUFlLFFBQWYsRUFBeUI7QUFDekIsbUNBQWdCLEdBQWhCLENBRHlCO3lCQUE3QixNQUVPO0FBQ0gsbUNBQU8sSUFBSSxNQUFKLENBREo7eUJBRlA7Ozs7dUJBVlI7Z0JBRDZCOztBQUNoQixxQkFBQSxLQUFBLEdBQUssS0FBTCxDQURnQjs7Z0JBbUI3QjtBQUdJLHlCQUhKLFdBR0ksQ0FBWSxHQUFaLEVBQTZCOzBDQUhqQyxhQUdpQzs7QUFGckIseUJBQUEsTUFBQSxHQUFjLENBQWQsQ0FFcUI7QUFDekIseUJBQUssTUFBTCxHQUFjLE1BQU0sU0FBTixDQUFnQixHQUFoQixDQUFkLENBRHlCO0FBRXpCLHlCQUFLLE1BQUwsR0FBYyxDQUFkLENBRnlCO2lCQUE3Qjs7NkJBSEo7OzJDQXNCUTtBQUNBLDZCQUFLLE1BQUwsR0FEQTs7Ozt3Q0FWSztBQUNMLCtCQUFPLEtBQUssTUFBTCxDQURGOzs7O3dDQUdFO0FBQ1AsK0JBQU8sS0FBSyxNQUFMLEdBQWMsQ0FBZCxDQURBOzs7O3dDQUdEO0FBQ04sK0JBQU8sS0FBSyxNQUFMLEdBQWMsS0FBSyxNQUFMLENBRGY7Ozs7MkNBVEksS0FBaUI7QUFDM0IsK0JBQU8sSUFBSSxXQUFKLENBQWdCLEdBQWhCLENBQVAsQ0FEMkI7Ozs7dUJBVG5DO2dCQW5CNkI7O0FBbUJoQixxQkFBQSxXQUFBLEdBQVcsV0FBWCxDQW5CZ0I7U0FBVCxDQUFBLENBQUEsV0FBQSxRQUFBLFFBQUEsS0FBQSxRQUFBLFFBQUEsR0FBUSxFQUFSLENBQUEsQ0FBQSxDQUFEO0tBQVAsQ0FBQSxDQUFBLFVBQUEsTUFBQSxPQUFBLEtBQUEsTUFBQSxPQUFBLEdBQU8sRUFBUCxDQUFBLENBQUEsQ0FBRDtDQUFmLENBQUEsQ0FBVSxVQUFBLFFBQUssRUFBTCxDQUFBLENBQVYiLCJmaWxlIjoiY2xhc3Nlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBhcEVNUC5DbGFzc2VzLkNvdW50ZXJzIHtcclxuICAgIGV4cG9ydCBjbGFzcyBSYW5nZSB7XHJcbiAgICAgICAgcHVibGljIGxlbmd0aDogbnVtYmVyO1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBzdGFydDogbnVtYmVyLCBvYmo6IG51bWJlcnxhbnlbXSkge1xyXG4gICAgICAgICAgICB0aGlzLmxlbmd0aCA9IFJhbmdlLmdldExlbmd0aChvYmopO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0IGVuZCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydCArIHRoaXMubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldExlbmd0aChvYmo6IG51bWJlciB8IGFueVtdKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gPG51bWJlcj4gb2JqO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iai5sZW5ndGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIExvb3BDb3VudGVyIHtcclxuICAgICAgICBwcml2YXRlIF9pbmRleDpudW1iZXI9MDtcclxuICAgICAgICByZWFkb25seSBsZW5ndGg6bnVtYmVyO1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKG9iajogbnVtYmVyfGFueVtdKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVuZ3RoID0gUmFuZ2UuZ2V0TGVuZ3RoKG9iaik7XHJcbiAgICAgICAgICAgIHRoaXMuX2luZGV4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhdGljIGNyZWF0ZShsZW5ndGg6IG51bWJlcik6TG9vcENvdW50ZXI7XHJcbiAgICAgICAgc3RhdGljIGNyZWF0ZShhcnJheTogYW55W10pOkxvb3BDb3VudGVyO1xyXG4gICAgICAgIHN0YXRpYyBjcmVhdGUob2JqOiBudW1iZXJ8YW55W10pOkxvb3BDb3VudGVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBMb29wQ291bnRlcihvYmopO1xyXG4gICAgICAgIH1cclxuICAgICAgICBnZXQgaW5kZXgoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2luZGV4O1xyXG4gICAgICAgIH1cclxuICAgICAgICBnZXQgY3VycmVudCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faW5kZXggKyAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBnZXQgYWN0aXZlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faW5kZXggPCB0aGlzLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0ZXAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2luZGV4Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
