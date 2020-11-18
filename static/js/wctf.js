/**
 * Created by zhangwei on 2019/4/12.
 */
//页面进来首先判断设备
var host = 'https://online_master.safe.qihoo.net'

function check() {
	var userAgentInfo = navigator.userAgent;
	var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
	var flag = true;
	for (var v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) > 0) {
			flag = false;
			break;
		}
	}
	return flag;
}
window.isPc = check()
var $bodyEl = $('body');
var $doc = $(document),
	$regBox = $('.reg-box');
var curTop = 0;
var verify_key = '';

var WCTF = function() {
	this.file = null
	this.init()
}
WCTF.prototype = {
	init: function() {
		var that = this
		//页面初始化，滚动条逻辑
		if ($(window).width() < 1400) {
			var w = (1400 - $(window).width()) / 2
			$("body,html").animate({
				scrollLeft: w
			}, 200);
		}
		//页面有交互逻辑的模块初始化
		that.corps()
	},
	header: function() { //导航头部的处理逻辑
		var that = this
		$doc
			.on('scroll', function(e) {
				//变量t是滚动条滚动时，距离顶部的距离
				setTimeout(function() {
					var h = $doc.scrollTop();
					var top = $bodyEl.position().top;
					headerH = $('.left-home').innerHeight()
					if (h > 60 || top < 0) {
						$('.wctf .header').removeClass('in-home').addClass('left-home')
					} else {
						$('.wctf .header').removeClass('left-home').addClass('in-home')
					}

					$('.construct').find('>div').each(function(index, item) {
						var $dom = $(item)
						var filter = $dom.offset().top - h
						if (isPc) {
							if (filter <= headerH) {
								$('.header .nav li').eq(index).addClass('active').siblings().removeClass('active')
								return
							}
						}
					})

				}, 100)
			})
			.on('click', '.header .main-nav li', function(e) {
				$dom = $(this)
				$dom.addClass('active').siblings().removeClass('active')
				//切换tab,页面滚动到相应的位置
				var id = $dom.find('>a').attr('href').split('#')[1]
				id && that.goLine(id)
			})
	},
	home: function() {
		var that = this
		$('#home').on('click', '.online-register', function(e) {
			e.preventDefault()
			$dom = $(this)
			//切换tab,页面滚动到相应的位置
			var id = $dom.attr('href').split('#')[1]
			that.goLine(id)
		}).on('click', '.register', function() {
			window.open('https://isc.360.com/2020/forum.html?id=111#/')
		})
	},
	corps: function() {
		var $corpItem = $('.world-map .corp-item')
		var corpSwiper = new Swiper('.swiper-container', {
			autoplay: 3000,
			autoplayDisableOnInteraction: false,
			loop: true,
			paginationClickable: true,
			pagination: '.swiper-pagination',
			createPagination: isPc ? false : true,
			onSlideChangeStart: function(swiper) {
				$corpItem.removeClass('active').eq(swiper.activeIndex - 1).addClass('active')
			},
			onInit: function(swiper) {
				$corpItem.eq(0).addClass('active')
			}
		})
		if (isPc) {
			$('.swiper-container').hover(function() {
				//swiper 插件bug
				corpSwiper.stopAutoplay()
			}, function() {
				corpSwiper.startAutoplay()
			})
			//鼠标悬浮到地图上，触发轮播的一些交互
			$('.world-map .corp-item').hover(function(e) {
				//获取该元素的index，轮播滚动到相应的位置，并停止
				var index = $corpItem.index(this)
				corpSwiper.swipeTo(index)
				corpSwiper.stopAutoplay()
			}, function(e) {
				//轮播继续滚动
				corpSwiper.startAutoplay()
			})
		} else {
			$('.swiper-container').on('touchstart', function() {
				//swiper 插件bug
				corpSwiper.stopAutoplay()
			}).on('touchend', function() {
				corpSwiper.startAutoplay()
			})
		}
	},
	rule: function() {
		var that = this
		$('#rule')
			.on('click', '.hack .roster, .new .roster', function(e) {
				e.preventDefault()
				$dom = $(this)
				//切换tab,页面滚动到相应的位置
				var id = $dom.attr('href').split('#')[1]
				that.goLine(id)
			})
			.on('click', '.online .roster', function(e) {
				e.preventDefault()
				that.initRegBox()
			})
			.on('click', '.rule-link', function() {
				var $this = $(this)
				$this.next('.cover').show()
				that.stopBodyScroll(true)
			})
		//注册表单代理事件
		$regBox.on('click', '.reg-btn>img', function(e) {
				e.preventDefault()
				var $regForm = $('.reg-form');
				//首先进行表单验证
				if ($regForm.valid()) {
					var form = new FormData();
					var location_id = $regForm.find('[name=location_id]').val()
					$.each($regForm.serializeArray(), function(index, item) {
						form.append(item.name, $.trim(item.value))
					})
					//multipart/form-data添加数组格式数据方法
					$.each(location_id, function(i, val) {
						form.append('country_id[]', val)
					})
					//
					form.append('verify_key', verify_key);
					form.append('team_file_logo', that.file);
					$.ajax({
						url: host + '/adminapi/crumb',
						cache: false,
						xhrFields: {
							withCredentials: true
						},
						success: function(data) {
							form.append('__crumb__', data.data.__crumb__);
							$.ajax({
								url: host + '/adminapi/register',
								method: 'POST',
								cache: false,
								xhrFields: {
									withCredentials: true
								},
								data: form,
								processData: false,
								contentType: false,
								success: function(data) {
									if (data.data && data.code == 200) {
										//注册成功隐藏注册弹框
										$('.reg-box .close').click()
										$('.reg-success').show()
										setTimeout(function() {
											$('.reg-success').hide()
										}, 5000)
									} else {
										//刷新验证码
										that.chgUrl($('.code-refresh'))
										alert(data.message)
									}
								},
								error: function(data) {
									//刷新验证码
									that.chgUrl($('.code-refresh'))
									var res = data.responseJSON;
									alert(res.message)
								},
							})
						},
					})
				}
			})
			.on('click', '.close', function() {
				$regBox.hide().html('')
			})
			.on('click', '.code-refresh-btn', function() {
				that.chgUrl($('.code-refresh'))
			})
			.on('change', 'input[type="radio"]', function() {
				$('.tab-content').find('>').toggleClass('active')
			})
		$doc.on('mouseover', '.dialog-help-tips', function(e) {
				var that = this;
				var targetData = $(this).data();
				var $dom = $(targetData.content)
				timer = setTimeout(function() {
					$(that).append($dom)
				}, 200);

			})
			.on('mouseout', '.dialog-help-tips', function(e) {
				timer && clearTimeout(timer);
				$(this).html('')
			});
	},
	cooperation: function() {
		var that = this
		if (!isPc) {
			$('.corps-list-btn').click(function() {
				$('.new-corps-box').show()
				that.stopBodyScroll(true)
			})
		}
	},
	initRegBox: function() {
		var that = this
		$regBox.show().append($('#reg-box-tmpl').html())
		that.stopBodyScroll(true)
		$('.code-refresh').attr('src', host + '/adminapi/answer-code')
		that.chgUrl($('.code-refresh'))
		this.initValidate()
		new uploadImg({
			callbacks: {
				onError: function() {
					that.file = null
				},
				onSuccess: function(file) { //选择文件通过校验
					that.file = file
				},
			}
		})
		$('.country-select').select2({ //注册弹框中select2插件初始化
			dropdownParent: $regBox,
			data: countryList
		});
	},
	removeRegEntry: function() {
		var that = this
		if (!that.checkAuditTime([2019, 5, 13, 16], [2019, 6, 3, 16])) {
			//不在注册期间内，移除注册入口
			$('.online-register').remove()
			$('.online .roster').remove()
		}
	},
	checkAuditTime: function(begin, end) {
		var nowDate = new Date($.ajax({
			async: false,
			type: 'HEAD'
		}).getResponseHeader("Date")).valueOf();
		if (arguments.length == 1) {
			var deadLine = Date.UTC.apply(Date.UTC, begin); //参数需要是数组格式
			return (nowDate <= deadLine)
		} else {
			var beginDate = Date.UTC.apply(Date.UTC, begin); //参数需要是数组格式
			var endDate = Date.UTC.apply(Date.UTC, end);
			return (nowDate - beginDate >= 0) && (nowDate <= endDate)
		}
	},
	goLine: function(id) { //点击锚点页面滚动到相应位置
		var headerH = $('.left-home').innerHeight()
		var h = $('#' + id).offset().top - 60;
		$("body,html").animate({
			scrollTop: h
		}, 200);
	},
	initValidate: function() {
		var $regForm = $('.reg-form');
		$.validator.addMethod("checkUsername", function(value, element, params) {
			var reg = /^[0-9a-zA-Z_]{6,15}$/;
			return reg.test(value);
		})
		$.validator.addMethod("checkPassword", function(value, element, params) {
			var reg = /^\S.{6,18}\S$/;
			return reg.test(value);
		})
		$.validator.addMethod("checkSecurityCode", function(value, element, params) {
			if ($("input[name='create_team']:checked").val() == 0) { //Join a  team 被选中
				var reg = /^[a-zA-Z]{5,6}$/;
				return reg.test(value);
			} else {
				return true
			}

		})
		$.validator.addMethod("checkTeamname", function(value, element, params) {
			if ($("input[name='create_team']:checked").val() == 1) { //Create a new team 被选中
				var reg = /^[^\s<>"'][^<>"']{1,13}[^\s<>"']$/;
				return reg.test(value);
			} else {
				return true
			}
		})
		$.validator.addMethod("checkEmail", function(value, element, params) {
			var reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
			return reg.test(value);
		})
		$regForm.validate({
			rules: {
				username: {
					checkUsername: true,
					remote: {
						type: "post",
						url: host + '/adminapi/site/user-exists',
						data: {
							username: function() {
								return $('input[name="username"]').val()
							}
						},
						dataFilter: function(data, type) {
							data = JSON.parse(data)
							if (data.data.exists) {
								return false;
							} else {
								return true;
							}
						}
					}
				},
				password: {
					checkPassword: true,
				},
				rePassword: {
					required: true,
					equalTo: '#password',
				},
				email: {
					checkEmail: true,
					remote: {
						type: "post",
						url: host + '/adminapi/site/user-exists',
						data: {
							email: function() {
								return $('input[name="email"]').val()
							}
						},
						dataFilter: function(data, type) {
							data = JSON.parse(data)
							if (data.data.exists) {
								return false;
							} else {
								return true;
							}
						}
					}
				},
				team_security_code: {
					checkSecurityCode: true
				},
				team_name: {
					checkTeamname: true,
					remote: {
						type: "post",
						url: host + '/adminapi/site/organization-exists',
						data: {
							team_name: function() {
								return $('input[name="team_name"]').val()
							}
						},
						dataFilter: function(data, type) {
							data = JSON.parse(data)
							if (data.data.exists) {
								return false;
							} else {
								return true;
							}
						}
					}
				},
				verify_code: {
					required: true,
				}
			},
			messages: {
				username: {
					checkUsername: 'Please enter a combination of letters, numbers and underlines (6-15 characters).',
					remote: 'Username has been occupied.'
				},
				password: {
					checkPassword: 'At least 8-20 characters, ,space is not allowed neither in the front nor in the end.',
				},
				rePassword: {
					required: '*Required',
					equalTo: "Please enter the same password again.",
				},
				email: {
					checkEmail: 'Please enter a valid email address.',
					remote: 'This email has been registered with us.'
				},
				team_security_code: {
					checkSecurityCode: 'Please enter a valid security code.'
				},
				team_name: {
					checkTeamname: 'At least 3-15 characters(expect <>, ‘’ or “”), space is not allowed in the front or the end.',
					remote: 'Team name has been occupied.'

				},
				verify_code: {
					required: '*Required',
				},

			},
			errorPlacement: function(error, element) {
				error.appendTo(element.parents('.item-group')[0]);
			},
			errorElement: 'div',
			errorClass: 'formError'

		});
	},
	chgUrl: function(dom) {
		var src = dom.attr("src");
		verify_key = (new Date()).valueOf()
		url = src.split('?')[0];
		url = url + "?verify_key=" + verify_key;
		dom.attr("src", url);
	},
	stopBodyScroll: function(isFixed) {
		setTimeout(function() {
			if (isFixed) {
				curTop = $(window).scrollTop();
				$bodyEl.css({
					position: 'fixed',
					top: -curTop + 'px',
					left: '0',
					right: '0'
				})

			} else {
				$bodyEl.css({
					position: '',
					top: '',
				})
				$(window).scrollTop(curTop);
			}
		}, 100)

	},
}
new WCTF()
