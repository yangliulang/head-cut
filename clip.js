/**
 *头像剪裁功能
 *此插件没有做兼容处理，做的过程中只是做思路逻辑分析，至于IE下，没有兼容开发，可在其他标准浏览器下运行，查看源代码
 *name:杨永
 *QQ  :377746756
 */
(function($) {
  var ClipPicture = function(clipWrap, setting) {
    var _this_ = this;
    //设置配置参数
    this.setting = {
      clipWidth: 50,
      clipHeight: 50
    };
    //扩展默认参数
    $.extend(this.setting, setting);
    //保存传递进来的剪切区域
    this.clipWrap = clipWrap;
    //保存剪裁区域相对于页面的偏移和剪裁区域的尺寸
    this.clipMainOffset = clipWrap.offset();
    this.clipScale = { width: clipWrap.width(), height: clipWrap.height() };
    //获取预览区域
    this.clipScaleView = clipWrap.next();
    this.viewImg = this.clipScaleView.find('.clip-layer')[0];

    //获取需要操作的DOM
    this.clipMoveDiv = clipWrap.find('.clip-move');
    this.clipImg = clipWrap.find('.clip-layer')[0];
    this.resizeClipBtn = this.clipMoveDiv.find('span');

    //初始化拖动功能
    this.initDrag();
    //初始化调整剪裁区域大小功能
    this.initClipScale();
  };
  ClipPicture.prototype = {
    //初始化调整剪裁区域大小功能
    initClipScale: function() {
      var self = this,
        resizeClipBtn = this.resizeClipBtn,
        doc = $(document),
        diffOpts = null,
        curBtn = null; //记录偏移量和宽度

      //绑定事件
      resizeClipBtn.mousedown(function(evt) {
        var _this = (curBtn = this);
        //取消事件冒泡
        evt.stopPropagation();
        evt.preventDefault();
        //更具点击的方位设置相对哪个点进行定为
        self.setPostion($(this));
        //设置偏移量可宽度
        diffOpts = {
          positionLeft: self.clipMoveDiv.position().left,
          positionTop: self.clipMoveDiv.position().top,
          offsetLeft: self.clipMoveDiv.offset().left,
          offsetTop: self.clipMoveDiv.offset().top,
          width: self.clipMoveDiv.width(),
          height: self.clipMoveDiv.height()
        };
        //绑定doc事件
        doc.bind('mousemove', mousemoveHandle);
        doc.bind('mouseup', mouseupHandle);
      });
      var mousemoveHandle = function(evt) {
        self.scale(evt, $(curBtn), diffOpts);
      };
      var mouseupHandle = function() {
        doc.unbind('mousemove', mousemoveHandle);
        doc.unbind('mouseup', mouseupHandle);
      };
    },
    scale: function(evt, curBtn, diffOpts) {
      var self = this;
      var clipMoveDiv = this.clipMoveDiv;
      //根据按钮类型执行函数
      if (curBtn.hasClass('right')) {
        self.scaleXAdd(evt, diffOpts);
      }
      if (curBtn.hasClass('left')) {
        self.scaleXMin(evt, diffOpts);
      }
      if (curBtn.hasClass('down')) {
        self.scaleYAdd(evt, diffOpts);
      }
      if (curBtn.hasClass('up')) {
        self.scaleYMin(evt, diffOpts);
      }
      if (curBtn.hasClass('right-up')) {
        self.scaleXAdd(evt, diffOpts);
        self.scaleYMin(evt, diffOpts);
      }
      if (curBtn.hasClass('right-down')) {
        self.scaleXAdd(evt, diffOpts);
        self.scaleYAdd(evt, diffOpts);
      }
      if (curBtn.hasClass('left-down')) {
        self.scaleYAdd(evt, diffOpts);
        self.scaleXMin(evt, diffOpts);
      }
      if (curBtn.hasClass('left-up')) {
        self.scaleYMin(evt, diffOpts);
        self.scaleXMin(evt, diffOpts);
      }
      //调整剪裁区域this.viewImg
      this.clipImg.style.clip =
        'rect(' +
        clipMoveDiv.position().top +
        'px ' +
        (clipMoveDiv.position().left + clipMoveDiv.width() + 2) +
        'px ' +
        (clipMoveDiv.position().top + clipMoveDiv.height() + 2) +
        'px ' +
        clipMoveDiv.position().left +
        'px)';

      this.viewImg.style.clip =
        'rect(' +
        clipMoveDiv.position().top +
        'px ' +
        (clipMoveDiv.position().left + clipMoveDiv.width() + 2) +
        'px ' +
        (clipMoveDiv.position().top + clipMoveDiv.height() + 2) +
        'px ' +
        clipMoveDiv.position().left +
        'px)';

      $(self.viewImg).css({
        left: -clipMoveDiv.position().left,
        top: -clipMoveDiv.position().top
      });
    },
    scaleXAdd: function(evt, diffOpts) {
      var width = evt.pageX - diffOpts.offsetLeft;
      width =
        width + diffOpts.positionLeft > this.clipScale.width
          ? this.clipScale.width - diffOpts.positionLeft
          : width;
      this.clipMoveDiv.css('width', width);
    },
    scaleXMin: function(evt, diffOpts) {
      var offsetRight =
        this.clipScale.width - diffOpts.width - diffOpts.positionLeft;
      var width = diffOpts.offsetLeft + diffOpts.width - evt.pageX;
      width =
        width + offsetRight > this.clipScale.width
          ? this.clipScale.width - offsetRight + 2
          : width;
      this.clipMoveDiv.css('width', width);
    },
    scaleYAdd: function(evt, diffOpts) {
      var height = evt.pageY - diffOpts.offsetTop;
      height =
        height + diffOpts.positionTop > this.clipScale.height
          ? this.clipScale.height - diffOpts.positionTop
          : height;
      this.clipMoveDiv.css('height', height);
    },
    scaleYMin: function(evt, diffOpts) {
      var offsetTop =
        this.clipScale.height - diffOpts.height - diffOpts.positionTop;
      var height = diffOpts.offsetTop + diffOpts.height - evt.pageY;
      height =
        height + offsetTop > this.clipScale.height
          ? this.clipScale.height - offsetTop + 2
          : height;
      this.clipMoveDiv.css('height', height);
    },
    //更具点击的方位设置相对哪个点进行
    setPostion: function(curBtn) {
      var self = this;
      var clipMoveDiv = this.clipMoveDiv;

      //获取相对父元素的偏移和自身的宽高
      var position = clipMoveDiv.position(),
        right =
          self.clipScale.width - (position.left + clipMoveDiv.width()) - 2,
        bottom =
          self.clipScale.height - (position.top + clipMoveDiv.height()) - 2;
      //根据class来定位
      if (curBtn.hasClass('left-up')) {
        clipMoveDiv.css({
          left: 'auto',
          top: 'auto',
          right: right + 'px',
          bottom: bottom
        });
      }
      if (curBtn.hasClass('right-up')) {
        clipMoveDiv.css({
          left: position.left,
          top: 'auto',
          right: 'auto',
          bottom: bottom
        });
      }
      if (curBtn.hasClass('right-down')) {
        clipMoveDiv.css({
          left: position.left,
          top: position.top,
          right: 'auto',
          bottom: 'auto'
        });
      }
      if (curBtn.hasClass('left-down')) {
        clipMoveDiv.css({
          left: 'auto',
          top: position.top,
          right: right,
          bottom: 'auto'
        });
      }
      if (curBtn.hasClass('left') || curBtn.hasClass('up')) {
        clipMoveDiv.css({
          left: 'auto',
          top: 'auto',
          right: right,
          bottom: bottom
        });
      }
      if (curBtn.hasClass('right') || curBtn.hasClass('down')) {
        clipMoveDiv.css({
          left: position.left,
          top: position.top,
          right: 'auto',
          bottom: 'auto'
        });
      }
    },
    //拖动功能
    initDrag: function() {
      var self = this;
      (clipMoveDiv = self.clipMoveDiv),
        (doc = $(document)),
        (layerOffset = null);
      clipMoveDiv.mousedown(function(evt) {
        evt.preventDefault();
        //获取鼠标layerX,layerY
        layerOffset = self.getLayerOffset(evt);
        //在document上绑定mousemove,mouseup
        doc.bind('mousemove', mousemoveHandle);
        doc.bind('mouseup', mouseupHandle);
      });
      //移动操作函数
      var mousemoveHandle = function(evt) {
        self.move(evt, layerOffset);
      };
      var mouseupHandle = function() {
        doc.unbind('mousemove', mousemoveHandle);
        doc.unbind('mouseup', mouseupHandle);
      };
    },
    //move
    move: function(evt, layerOffset) {
      var self = this;
      var moveDiv = this.clipMoveDiv;
      var left = this.getMoveOffset(evt, layerOffset).left,
        top = this.getMoveOffset(evt, layerOffset).top;
      var maxW = this.clipScale.width - moveDiv.width() - 2,
        maxH = this.clipScale.height - moveDiv.height() - 2;
      //通过指定区域去限制拖动的范围
      left = left < 0 ? 0 : left > maxW ? maxW : left;
      top = top < 0 ? 0 : top > maxH ? maxH : top;
      moveDiv.css({
        left: left,
        top: top
      });
      $(self.viewImg).css({
        left: -left,
        top: -top
      });
      self.moveClipRect(left, top);
    },
    //驱动剪裁区域
    moveClipRect: function(left, top) {
      //clip:rect(0 100px 100px 0);
      this.clipImg.style.clip =
        'rect(' +
        top +
        'px ' +
        (left + this.clipMoveDiv.width() + 2) +
        'px ' +
        (top + this.clipMoveDiv.height() + 2) +
        'px ' +
        left +
        'px)';
      this.viewImg.style.clip =
        'rect(' +
        top +
        'px ' +
        (left + this.clipMoveDiv.width() + 2) +
        'px ' +
        (top + this.clipMoveDiv.height() + 2) +
        'px ' +
        left +
        'px)';
    },
    //获取移动的left，top
    getMoveOffset: function(evt, layerOffset) {
      return {
        left: evt.pageX - this.clipMainOffset.left - layerOffset.layerX,
        top: evt.pageY - this.clipMainOffset.top - layerOffset.layerY
      };
    },
    //获取鼠标layerX,layerY
    getLayerOffset: function(evt) {
      //就是鼠标的相对页面的偏移减去当前层相对于页面的偏移
      return {
        layerX: evt.pageX - this.clipMoveDiv.offset().left,
        layerY: evt.pageY - this.clipMoveDiv.offset().top
      };
    }
  };
  //注册到全局
  window.ClipPicture = ClipPicture;
})(jQuery);
