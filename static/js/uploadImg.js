/**
 * Created by apple on 2019/4/11.
 */
(function ($, global) {
    "use strict";
    var uploadImg = function (opt) {
        var defaultOpt = {
            handler: '.custom-file',
            validation: {
                allowedExtensions: ['jpg', 'png'],
                maxSize: 50,//单位是50K
                image: {
                    maxHeight: 120,
                    maxWidth: 120,
                    minHeight: 120,
                    minWidth: 120
                },
            },
            callbacks: {
                onSuccess: function () {//选择文件通过校验
                },
                onError: function () {//选择文件没有通过校验
                }
            }
        }
        this.opt = $.extend({}, defaultOpt, opt)
        this.$h = $(this.opt.handler)
        this.init()
    }
    uploadImg.prototype = {
        init: function () {
            this.$clearBtn = this.$h.find('.clear-btn')
            this.$uploadImg = this.$h.find('.upload-img')
            this.$note = this.$h.find('.note')
            this.bindEvent()
        },
        validateFile: function (file) {
            var that = this,
                validation = that.opt.validation;
            return $.Deferred(function (dfd) {//$.Deferred()所生成的deferred对象作为函数的默认参数
                var image = new Image(),
                    url = window.URL || window.webkitURL || null
                if (url) {
                    image.src = url.createObjectURL(file);
                    image.onload = function () {
                        var imgPx = [this.width, this.height]
                        var checkExtName = function () {// 校验文件格式
                            var suffixIndex = file.name.lastIndexOf(".")
                            var suffix = file.name.substring(suffixIndex + 1).toLowerCase()
                            if ($.inArray(suffix, validation.allowedExtensions) === -1) {

                                dfd.reject({error: '文件格式错误'})
                            }
                        }
                        var checkSize = function () {
                            //校验文件大小
                            if (file.size / (1024) >validation.maxSize) {
                                dfd.reject({error: '文件大小错误'})
                            }else{
                                dfd.resolve(image)
                            }
                        }
                        var checkPx = function () {
                            if (imgPx[0] == imgPx[1]) {//imgPx[0] == imgPx[1]
                                dfd.resolve(image)
                            } else {
                                dfd.reject({error: '文件格式错误'})
                            }
                        }
                        checkExtName()
                        checkSize()
                        // checkPx()
                    };
                    image.onerror = function (err) {
                        dfd.reject({error: '加载错误'})
                    };
                }
            }).promise();
        },
        bindEvent: function () {
            var that = this,
                _opt = that.opt
            this.$h
                .on('change', '[type=file]', function (e) {
                    var $fileDom = $(this),
                        self = this
                    that.validateFile(this.files[0]).then(function (image) {
                        //文件通过正则校验
                        that.$note.removeClass('error')
                        that.$uploadImg[0].src = image.src
                        that.$clearBtn.css('display', 'inline-block')
                        _opt.callbacks.onSuccess(self.files[0])
                    }, function (data) {
                        //文件没有通过正则校验
                        that.$note.addClass('error')
                        that.$clearBtn.click()
                    }).always(function () {
                        $fileDom.val('')
                    })
                })
                .on('click', '.clear-btn', function (e) {
                    e.preventDefault()
                    that.$uploadImg[0].src = 'https://p3.ssl.qhimg.com/t0104f5592454eb56e7.png'
                    that.$clearBtn.hide()
                    _opt.callbacks.onError()
                })
        }
    }
    if (typeof define === "function" && define.amd) {
        define(function () {
            return uploadImg;
        });
    } else if (typeof module !== "undefined" && module.exports) {
        module.exports = uploadImg;
    } else {
        global.uploadImg = uploadImg;
    }
})(jQuery, window);