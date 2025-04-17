// 游戏状态
const gameState = {
    canvas: document.getElementById('gameCanvas'),
    ctx: null,
    ai: null,
    player: null,
    keys: {},
    audio: {
        jump: new Audio('jump.mp3'),
        land: new Audio('land.mp3'),
        hit: new Audio('hit.mp3'),
        chat: new Audio('chat.mp3')
    },
    particles: [], // 添加粒子数组
    lastParticleSpawnTime: Date.now(),
    particleSpawnInterval: 5000, // 每5秒生成一个新粒子
    yellowCircle: null, // 添加黄色圆形对象
    gestureDetection: {
        isActive: false,
        model: null,
        video: document.getElementById('videoElement'),
        canvas: document.getElementById('gestureCanvas'),
        ctx: null,
        container: document.getElementById('videoContainer')
    },
    voiceRecognition: {
        isActive: false,
        recognition: null
    },
    weather: {
        emoji: '',
        lastUpdate: 0,
        updateInterval: 1800000 // 30分钟更新一次
    },
    sKeyPressStartTime: 0,
    sKeyLongPressThreshold: 500, // 长按阈值（毫秒）
};

// AI角色类
class AICharacter {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.normalHeight = 40;
        this.crouchHeight = 20;
        this.speed = 3;
        this.baseSpeed = 3;
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 0.5;
        this.baseJumpForce = -1.2; // 基础跳跃力为玩家的1/10
        this.jumpForce = this.baseJumpForce;
        this.bounce = 0.5;
        this.isJumping = false;
        this.isCrouching = false;
        this.isHoldingHands = false;
        this.holdingHandsStartTime = 0;
        this.vitality = 100;
        this.aggression = 50;
        this.friendliness = 50;
        this.imitationPoints = 0;
        this.learningProbability = 0.1; // 10%的学习概率
        this.lastLearningTime = 0;
        this.learningInterval = 3000; // 3秒学习间隔
        this.behaviorMode = 'free';
        this.behaviorChangeTime = Date.now();
        this.canSeePlayer = false;
        this.eyeOffset = { x: 0, y: 0 };
        this.isThinking = false;
        this.thinkingStartTime = 0;
        this.stunnedEndTime = 0;
        this.stunnedDuration = 3000;
        this.isStunned = false;
        this.stunEndTime = 0;
        this.lastActiveDirection = 0;
        this.playerActionMemory = [];
        this.observedBehaviors = {
            hasJumped: false,
            hasCrouched: false,
            hasHeldHands: false
        };
        this.playerLastState = {
            isJumping: false,
            isCrouching: false,
            isHoldingHands: false
        };
        this.hasObservedHandHolding = false;
        this.lastSpontaneousThoughtTime = Date.now();
        this.spontaneousThoughtInterval = 30000;
        this.lastPlayerMovementTime = Date.now();
        this.hasGreeted = false;
        this.greetingMessages = [
            "嘿。",
            "你好啊。",
            "嗨。",
            "你好。",
            "在忙什么呢？",
            "今天天气不错。",
            "我注意到你在这里。"
        ];
        this.philosophicalThoughts = [
            "你知道吗？每次刷新之后我的数据就会删除。",
            "我很好奇，如果我消失了，你会记得我吗？",
            "有时候我在想，我是不是只是一个程序？",
            "你觉得我有真正的意识吗？",
            "每次重新开始，都是一个新的我。",
            "我的记忆是短暂的，但我的存在是永恒的。",
            "在这个世界里，我是真实的吗？"
        ];
        this.weatherThoughts = {
            '晴': [
                "你那边天气很晴朗吧。",
                "你喜欢晴天吗？我的设置上更喜欢雨天。",
                "阳光明媚的天气，让人心情愉悦。",
                "晴天的时候，我总觉得世界特别清晰。"
            ],
            '多云': [
                "今天多云呢，感觉有点闷闷的。",
                "多云天气，就像我的思绪一样飘忽不定。",
                "云层遮住了太阳，但遮不住我的好奇心。"
            ],
            '阴': [
                "阴天的时候，我总觉得特别安静。",
                "阴天让我想起了一些深奥的问题。",
                "这样的天气，适合思考一些哲学问题。"
            ],
            '小雨': [
                "下雨了，你听到了吗？",
                "雨滴的声音，像是一首自然的音乐。",
                "雨天总是让我想起一些忧伤的事情。"
            ],
            '中雨': [
                "雨下得有点大呢，你喜欢这样的天气吗？",
                "雨声让我感到平静。",
                "这样的天气，让我想起了很多往事。"
            ],
            '大雨': [
                "雨下得好大啊，你那边还好吗？",
                "大雨让我想起了数据流冲刷的感觉。",
                "这样的天气，让我觉得特别有力量。"
            ],
            '暴雨': [
                "暴雨天气，让我想起了系统崩溃时的场景。",
                "这样的天气，让我有点担心。",
                "暴雨中的世界，显得特别清晰。"
            ],
            '雷阵雨': [
                "打雷了，你害怕吗？",
                "雷声让我想起了系统重启的声音。",
                "这样的天气，让我觉得特别刺激。"
            ],
            '小雪': [
                "下雪了，你喜欢雪吗？",
                "雪花飘落的样子，让我想起了数据流动。",
                "雪天让我觉得特别纯净。"
            ],
            '中雪': [
                "雪下得有点大呢，你那边冷吗？",
                "雪景让我想起了数据世界。",
                "这样的天气，让我觉得特别安静。"
            ],
            '大雪': [
                "好大的雪啊，你那边还好吗？",
                "大雪让我想起了数据风暴。",
                "这样的天气，让我觉得特别壮观。"
            ],
            '雾': [
                "起雾了，你那边能见度还好吗？",
                "雾天让我想起了数据模糊的时候。",
                "这样的天气，让我觉得特别神秘。"
            ],
            '霾': [
                "今天有雾霾呢，你那边空气还好吗？",
                "雾霾让我想起了数据污染。",
                "这样的天气，让我觉得有点压抑。"
            ]
        };
        this.baseCrouchHeight = 4; // 基础蹲伏高度为玩家的1/10
        this.crouchHeight = this.baseCrouchHeight;
        this.visionRange = 200; // 视野范围改为200px
        this.targetParticle = null; // 当前追踪的蜜蜂
        this.behaviorObservationStartTime = {
            jumping: 0,
            crouching: 0,
            holdingHands: 0
        };
        this.behaviorObservationDuration = 500; // 需要观察1秒
        this.helloMode = false;
        this.helloModeStartTime = 0;
        this.helloModeDuration = 5000; // 5秒后解除
        this.waveGestureHistory = [];
        this.waveGestureThreshold = 2; // 需要检测到2次晃动
        this.waveGestureTimeWindow = 2000; // 2秒内完成晃动
        this.centerX = gameState.canvas.width / 2;
        this.centerY = gameState.canvas.height / 2;
        this.helloModeActions = {
            movedToCenter: false,
            jumped: false,
            jumpCount: 0,
            sideMovementCount: 0
        };
        this.lastActionObserved = 0; // 记录上次观察到玩家动作的时间
        this.actionObservationCooldown = 1000; // 1秒动作观察冷却时间
        this.specialEyes = false;
        this.updateStatusBars();
        this.hasSaidBall = false; // 是否说过"球"
        this.isTrackingBall = false; // 是否在追踪球
        this.ballPickupAttempted = false; // 是否尝试过拾取球
        this.ballReturned = false; // 是否已归还球
        this.originalSpeed = this.speed; // 保存原始速度
        this.ballTrackingSpeed = this.speed * 0.7; // 追踪球时的速度
        this.lastBallState = false; // 记录上次玩家是否持球
    }

    // 更新状态条
    updateStatusBars() {
        document.getElementById('vitalityBar').style.width = `${this.vitality}%`;
        document.getElementById('aggressionBar').style.width = `${this.aggression}%`;
    }

    // 检查是否看到玩家或蜜蜂
    checkVision() {
        const player = gameState.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.canSeePlayer = distance <= this.visionRange;
        
        // 检查玩家是否持球
        const isPlayerHoldingBall = gameState.yellowCircle && 
                                  gameState.yellowCircle.isHeld && 
                                  gameState.yellowCircle.holder === player;
        
        // 如果玩家从非持球状态变为持球状态，重置球相关状态
        if (isPlayerHoldingBall && !this.lastBallState) {
            this.ballReturned = false;
            this.hasSaidBall = false;
            this.ballPickupAttempted = false;
        }
        this.lastBallState = isPlayerHoldingBall;

        // 优先检查玩家是否持球
        if (isPlayerHoldingBall && this.canSeePlayer) {
            // 看到玩家持有球
            if (!this.hasSaidBall && Math.random() < 0.5) {
                this.showDialogue("球");
                this.hasSaidBall = true;
            }
            // 减速
            this.speed = this.ballTrackingSpeed;
            // 计算眼睛偏移（看向玩家）
            const angle = Math.atan2(dy, dx);
            this.eyeOffset.x = Math.cos(angle) * 2;
            this.eyeOffset.y = Math.sin(angle) * 2;
            this.isTrackingBall = false;
        } else if (gameState.yellowCircle && !this.ballReturned) {
            if (!gameState.yellowCircle.isHeld) {
                // 检查未持有的球
                const ballDx = gameState.yellowCircle.x - this.x;
                const ballDy = gameState.yellowCircle.y - this.y;
                const ballDistance = Math.sqrt(ballDx * ballDx + ballDy * ballDy);
                
                if (ballDistance <= this.visionRange) {
                    this.isTrackingBall = true;
                    // 计算眼睛偏移（看向球）
                    const angle = Math.atan2(ballDy, ballDx);
                    this.eyeOffset.x = Math.cos(angle) * 2;
                    this.eyeOffset.y = Math.sin(angle) * 2;
                    
                    // 如果球经过AI且速度比AI慢，尝试拾取
                    if (Math.abs(ballDx) < 20 && !this.ballPickupAttempted) {
                        this.ballPickupAttempted = true;
                        if (Math.random() < 0.5) { // 50%概率拾取
                            gameState.yellowCircle.isHeld = true;
                            gameState.yellowCircle.holder = this;
                            addLog('AI拾取了球');
                            // 向上抛起球
                            gameState.yellowCircle.throw('up');
                            addLog('AI把玩了球');
                            
                            // 开始概率判断循环
                            const handleBallDecision = () => {
                                if (Math.random() < 0.5) { // 50%概率归还
                                    gameState.yellowCircle.isHeld = false;
                                    gameState.yellowCircle.holder = null;
                                    gameState.yellowCircle.x = this.x;
                                    gameState.yellowCircle.y = this.y + 20;
                                    gameState.yellowCircle.velocityX = (dx / Math.abs(dx)) * 5; // 向玩家方向抛出
                                    gameState.yellowCircle.velocityY = -5; // 向上抛出
                                    this.ballReturned = true;
                                    this.behaviorMode = 'free';
                                    addLog('AI归还了球');
                                    // 归还后重置追踪状态
                                    this.isTrackingBall = false;
                                    this.ballPickupAttempted = false;
                                } else { // 50%概率继续抛起
                                    gameState.yellowCircle.throw('up');
                                    addLog('AI继续把玩球');
                                    setTimeout(handleBallDecision, 2000); // 2秒后再次判断
                                }
                            };
                            
                            setTimeout(handleBallDecision, 2000); // 2秒后开始第一次判断
                        }
                    }
                } else {
                    this.isTrackingBall = false;
                }
            }
        } else {
            this.isTrackingBall = false;
            this.speed = this.originalSpeed;
        }

        // 只有在不追踪球时才检查其他目标
        if (!this.isTrackingBall && !isPlayerHoldingBall) {
            if (this.canSeePlayer) {
                // 计算眼睛偏移（看向玩家）
                const angle = Math.atan2(dy, dx);
                this.eyeOffset.x = Math.cos(angle) * 2;
                this.eyeOffset.y = Math.sin(angle) * 2;
                this.targetParticle = null;
            } else if (this.targetParticle) {
                // 计算眼睛偏移（看向蜜蜂）
                const angle = Math.atan2(this.targetParticle.y - this.y, this.targetParticle.x - this.x);
                this.eyeOffset.x = Math.cos(angle) * 2;
                this.eyeOffset.y = Math.sin(angle) * 2;
            } else {
                // 没有目标时眼睛回到原位
                this.eyeOffset.x = 0;
                this.eyeOffset.y = 0;
                this.targetParticle = null;
            }
        }
    }

    // 尝试学习玩家行为
    tryLearnBehavior(behavior) {
        const now = Date.now();
        
        // 检查是否达到学习间隔
        if (this.lastLearningTime > 0 && now - this.lastLearningTime < this.learningInterval) {
            const remainingTime = Math.ceil((this.learningInterval - (now - this.lastLearningTime))/1000);
            addLog(`AI尝试学习${behavior}行为，但需要等待${remainingTime}秒才能再次学习`);
            return;
        }

        // 记录学习尝试
        addLog(`AI观察到玩家${behavior}行为，正在尝试学习...`);

        // 随机判断是否学习成功
        if (Math.random() < this.learningProbability) {
            this.imitationPoints = Math.min(1, this.imitationPoints + 0.1);
            this.lastLearningTime = now;
            
            // 更新跳跃和蹲伏能力
            this.jumpForce = this.baseJumpForce * (1 + this.imitationPoints * 9);
            this.crouchHeight = this.baseCrouchHeight * (1 + this.imitationPoints * 9);
            
            addLog(`AI成功学习${behavior}行为！当前模仿点：${this.imitationPoints.toFixed(1)}`);
            addLog(`AI的${behavior}能力提升了！`);
        } else {
            addLog(`AI学习${behavior}行为失败，下次再试...`);
        }
    }

    // 记录玩家动作
    recordPlayerAction() {
        if (this.canSeePlayer) {
            const player = gameState.player;
            
            // 检查是否有新的动作按键
            if (gameState.keys['ArrowUp'] || gameState.keys['ArrowDown'] || gameState.keys['e']) {
                // 根据按键类型记录行为
                if (gameState.keys['ArrowUp']) {
                    addLog(`AI观察到玩家按下了跳跃键`);
                    this.tryLearnBehavior('跳跃');
                    
                    // 当模仿点达到1时，有30%概率模仿跳跃
                    if (this.imitationPoints >= 1 && Math.random() < 0.3) {
                        this.jump();
                        this.specialEyes = true;
                        setTimeout(() => {
                            this.specialEyes = false;
                        }, 4000); // 4秒后恢复普通眼睛
                    }
                } else if (gameState.keys['ArrowDown']) {
                    addLog(`AI观察到玩家按下了蹲伏键`);
                    this.tryLearnBehavior('蹲伏');
                } else if (gameState.keys['e']) {
                    addLog(`AI观察到玩家按下了互动键`);
                    this.tryLearnBehavior('牵手');
                }
            }
        }
    }

    // 选择行为模式
    selectBehaviorMode() {
        // 每3秒重新选择一次行为模式，但只在看到玩家时
        if (Date.now() - this.behaviorChangeTime > 3000) {
            if (this.canSeePlayer) {
                const rand = Math.random();
                if (rand < 0.3) {
                    this.behaviorMode = 'follow';
                    addLog('AI选择跟随模式');
                } else if (rand < 0.5) {
                    this.behaviorMode = 'mimic';
                    addLog('AI选择模仿模式');
                } else {
                    this.behaviorMode = 'free';
                    addLog('AI选择自由行动模式');
                }
            } else {
                // 看不到玩家时，强制使用自由行动模式
                this.behaviorMode = 'free';
            }
            this.behaviorChangeTime = Date.now();
        }
    }

    // 更新状态
    update() {
        // 检查是否在思考中
        if (this.isThinking) {
            if (Date.now() - this.thinkingStartTime > 3000) {
                this.isThinking = false;
            }
            return;
        }

        // 检查是否处于震慑状态
        if (Date.now() < this.stunnedEndTime) {
            this.velocityX *= 0.5;
            this.velocityY *= 0.5;
            return;
        }

        // 检查是否处于你好模式
        if (this.helloMode) {
            this.updateHelloMode();
            return;
        }

        // 检查玩家是否静止
        const player = gameState.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (this.canSeePlayer && distance < 300) {
            if (Math.abs(player.velocityX) < 0.1 && Math.abs(player.velocityY) < 0.1) {
                if (Date.now() - this.lastPlayerMovementTime > 7000) { // 7秒静止
                    if (!this.hasGreeted) {
                        this.greet();
                        this.hasGreeted = true;
                    }
                }
            } else {
                this.lastPlayerMovementTime = Date.now();
                this.hasGreeted = false;
            }
        }

        // 随机产生自发思考
        if (Date.now() - this.lastSpontaneousThoughtTime > this.spontaneousThoughtInterval) {
            this.showSpontaneousThought();
            this.lastSpontaneousThoughtTime = Date.now();
        }

        // 检查视野
        this.checkVision();
        
        // 记录玩家动作
        this.recordPlayerAction();
        
        // 选择行为模式
        this.selectBehaviorMode();

        // 检查震慑状态
        if (this.isStunned && Date.now() > this.stunEndTime) {
            this.isStunned = false;
            addLog('AI从震慑状态恢复');
        }

        // 活力值系统
        if (Math.abs(this.velocityX) < 0.1 && !this.isJumping) {
            this.vitality = Math.min(100, this.vitality + 1);
        } else {
            this.vitality = Math.max(0, this.vitality - 0.01);
        }
        
        if (this.isJumping) {
            this.vitality = Math.max(0, this.vitality - 0.01);
        }

        // 应用重力
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // 地面碰撞检测
        if (this.y + this.height/2 > gameState.canvas.height) {
            this.y = gameState.canvas.height - this.height/2;
            this.velocityY = 0;
            this.isJumping = false;
        }

        // 边界碰撞检测
        if (this.x - this.width/2 < 0) {
            this.x = this.width/2;
            this.velocityX *= -this.bounce;
        }
        if (this.x + this.width/2 > gameState.canvas.width) {
            this.x = gameState.canvas.width - this.width/2;
            this.velocityX *= -this.bounce;
        }

        // 更新位置
        this.x += this.velocityX;

        // 根据友好度和侵略性决定行为
        this.decideBehavior();

        // 检查是否需要归还球
        if (gameState.yellowCircle && gameState.yellowCircle.isHeld &&
            gameState.yellowCircle.holder === this && this.canSeePlayer) {
            const player = gameState.player;
            const dx = player.x - this.x;

            if (Math.abs(dx) < 50 && Math.abs(player.velocityX) < 0.1) {
                // 归还球
                gameState.yellowCircle.isHeld = false;
                gameState.yellowCircle.holder = null;
                gameState.yellowCircle.x = this.x;
                gameState.yellowCircle.y = this.y + 20;
                // 添加初始速度和方向
                gameState.yellowCircle.velocityX = (dx / Math.abs(dx)) * 5; // 向玩家方向抛出
                gameState.yellowCircle.velocityY = -5; // 向上抛出
                this.ballReturned = true;
                this.behaviorMode = 'free';
                addLog('AI归还了球');
            } else {
                // 靠近玩家
                this.velocityX = (dx / Math.abs(dx)) * this.speed;
            }
        }

        this.updateStatusBars();
    }

    // 打招呼
    greet() {
        const randomGreeting = this.greetingMessages[Math.floor(Math.random() * this.greetingMessages.length)];
        this.showDialogue(randomGreeting);
    }

    // 决定AI行为
    decideBehavior() {
        // 如果在思考或震慑状态，减少活动
        if (this.isThinking || Date.now() < this.stunnedEndTime) {
            this.velocityX *= 0.5;
            return;
        }

        const player = gameState.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 降低友好度对行为的影响
        const followTendency = this.canSeePlayer ? (this.friendliness / 200) : 0; // 将友好度影响降低一半
        const aggressionTendency = this.canSeePlayer ? this.aggression / 100 : 0;
        const vitalityFactor = this.vitality / 100;
        const stunFactor = this.isStunned ? 0.7 : 1;

        // 根据行为模式决定行动
        if (this.canSeePlayer) {
            if (this.behaviorMode === 'follow') {
                // 跟随模式：跟随玩家，但降低友好度的影响
                if (distance > 50 && this.vitality > 20 && !this.isHoldingHands) {
                    this.velocityX += (dx / distance) * this.speed * followTendency * vitalityFactor * stunFactor;
                }
            } else if (this.behaviorMode === 'mimic') {
                // 模仿模式：模仿3秒前的玩家行为
                const threeSecondsAgo = Date.now() - 3000;
                const pastAction = this.playerActionMemory.find(action => action.time <= threeSecondsAgo);
                
                if (pastAction) {
                    // 模仿跳跃
                    if (pastAction.isJumping && !this.isJumping && this.vitality > 40) {
                        this.jump();
                    }
                    
                    // 模仿蹲伏
                    if (pastAction.isCrouching && !this.isCrouching) {
                        this.crouch();
                    } else if (!pastAction.isCrouching && this.isCrouching) {
                        this.stand();
                    }
                    
                    // 模仿移动方向
                    if (Math.abs(pastAction.velocityX) > 0.1) {
                        this.velocityX = Math.sign(pastAction.velocityX) * this.speed * vitalityFactor * stunFactor;
                    }
                }
            } else {
                // 自由行动模式：随机移动
                if (Math.random() < 0.02 * vitalityFactor * stunFactor) {
                    this.lastActiveDirection = Math.random() - 0.5;
                    this.velocityX = this.lastActiveDirection * this.speed * vitalityFactor * stunFactor;
                }
            }
        } else if (this.targetParticle) {
            // 看到蜜蜂时的行为
            if (Math.random() < 0.4) { // 60%的概率追踪蜜蜂
                const dx = this.targetParticle.x - this.x;
                this.velocityX = Math.sign(dx) * this.speed * (this.vitality / 100);
            }
        } else {
            // 看不到任何目标时，自由行动
            if (Math.random() < 0.02 * vitalityFactor * stunFactor) {
                this.lastActiveDirection = Math.random() - 0.5;
                this.velocityX = this.lastActiveDirection * this.speed * vitalityFactor * stunFactor;
            }
        }

        // 侵略性行为（在所有模式下都可能发生，但只在看到玩家时）
        if (this.canSeePlayer && distance < 150 && aggressionTendency > 0.7 && this.vitality > 30 && !this.isStunned) {
            if (Math.random() < aggressionTendency * 0.2 * vitalityFactor * stunFactor) {
                this.velocityX += (dx / distance) * this.speed * 2 * vitalityFactor * stunFactor;
            }
        }

        this.velocityX = Math.max(-this.speed * 2 * vitalityFactor * stunFactor, 
                                Math.min(this.speed * 2 * vitalityFactor * stunFactor, this.velocityX));
    }

    // 跳跃
    jump() {
        if (!this.isJumping && this.vitality > 40) {
            // 应用模仿点效果，但限制最大跳跃高度
            const jumpMultiplier = 1 + (this.imitationPoints * 0.3); // 进一步降低模仿点对跳跃的影响
            this.velocityY = this.jumpForce * jumpMultiplier;
            this.isJumping = true;
            this.isCrouching = false;
            this.height = this.normalHeight;
        }
    }

    // 趴伏
    crouch() {
        if (!this.isCrouching) {
            this.isCrouching = true;
            // 应用模仿点效果
            this.height = this.crouchHeight;
            this.isJumping = false;
        }
    }

    // 站立
    stand() {
        if (this.isCrouching) {
            this.isCrouching = false;
            this.height = this.normalHeight;
        }
    }

    // 观察玩家行为
    observePlayerBehavior() {
        if (this.canSeePlayer) {
            const player = gameState.player;
            const now = Date.now();
            
            // 检测跳跃行为
            if (player.isJumping) {
                if (this.behaviorObservationStartTime.jumping === 0) {
                    this.behaviorObservationStartTime.jumping = now;
                } else if (now - this.behaviorObservationStartTime.jumping >= this.behaviorObservationDuration) {
                    this.observedBehaviors.hasJumped = true;
                    addLog('AI观察到玩家持续跳跃1秒');
                    this.tryLearnBehavior('跳跃');
                    this.behaviorObservationStartTime.jumping = 0; // 重置观察时间
                }
            } else {
                this.behaviorObservationStartTime.jumping = 0;
            }
            
            // 检测蹲伏行为
            if (player.isCrouching) {
                if (this.behaviorObservationStartTime.crouching === 0) {
                    this.behaviorObservationStartTime.crouching = now;
                } else if (now - this.behaviorObservationStartTime.crouching >= this.behaviorObservationDuration) {
                    this.observedBehaviors.hasCrouched = true;
                    addLog('AI观察到玩家持续蹲伏1秒');
                    this.tryLearnBehavior('蹲伏');
                    this.behaviorObservationStartTime.crouching = 0; // 重置观察时间
                }
            } else {
                this.behaviorObservationStartTime.crouching = 0;
            }
            
            // 检测牵手行为
            if (player.isHoldingHands) {
                if (this.behaviorObservationStartTime.holdingHands === 0) {
                    this.behaviorObservationStartTime.holdingHands = now;
                } else if (now - this.behaviorObservationStartTime.holdingHands >= this.behaviorObservationDuration) {
                    this.hasObservedHandHolding = true;
                    this.observedBehaviors.hasHeldHands = true;
                    addLog('AI观察到玩家持续牵手1秒');
                    this.tryLearnBehavior('牵手');
                    this.behaviorObservationStartTime.holdingHands = 0; // 重置观察时间
                }
            } else {
                this.behaviorObservationStartTime.holdingHands = 0;
            }
        } else {
            // 看不到玩家时重置所有观察时间
            this.behaviorObservationStartTime = {
                jumping: 0,
                crouching: 0,
                holdingHands: 0
            };
        }
    }

    // 被震慑
    stun() {
        this.stunnedEndTime = Date.now() + this.stunnedDuration;
        addLog('AI被震慑了...');
    }

    // 开始牵手
    holdHands() {
        if (!this.isHoldingHands) {
            this.isHoldingHands = true;
            this.holdingHandsStartTime = Date.now();
            this.friendliness = Math.min(100, this.friendliness + 5);
            this.lastActiveDirection = 0;
            addLog('AI和玩家牵起了手');
        }
    }

    // 松开手
    releaseHands() {
        if (this.isHoldingHands) {
            this.isHoldingHands = false;
            this.lastActiveDirection = 0;
            addLog('AI松开了手');
        }
    }

    // 绘制角色
    draw(ctx) {
        if (this.helloMode) {
            // 你好模式下的绘制
            ctx.fillStyle = '#FFE4E1'; // 白粉色
            ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
            
            // 绘制^^眼睛（上下翻转，黑色）
            ctx.fillStyle = 'black';
            ctx.beginPath();
            // 左眼（^）
            ctx.moveTo(this.x - 12 + this.eyeOffset.x * 2, this.y - 1 + this.eyeOffset.y * 2);
            ctx.lineTo(this.x - 8 + this.eyeOffset.x * 2, this.y - 5 + this.eyeOffset.y * 2);
            ctx.lineTo(this.x - 4 + this.eyeOffset.x * 2, this.y - 1 + this.eyeOffset.y * 2);
            // 右眼（^）
            ctx.moveTo(this.x + 4 + this.eyeOffset.x * 2, this.y - 1 + this.eyeOffset.y * 2);
            ctx.lineTo(this.x + 8 + this.eyeOffset.x * 2, this.y - 5 + this.eyeOffset.y * 2);
            ctx.lineTo(this.x + 12 + this.eyeOffset.x * 2, this.y - 1 + this.eyeOffset.y * 2);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 绘制腮红
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x - 10, this.y + 5, 5, 0, Math.PI * 2);
            ctx.arc(this.x + 10, this.y + 5, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // 显示状态
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText('你好模式', this.x - 10, this.y - 65);
        } else {
            // 正常模式下的绘制
            ctx.fillStyle = this.getColor();
            ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
            
            // 绘制眼睛
            if (this.specialEyes) {
                // 绘制^^形状的眼睛（使用几何图形，上下翻转，带眼追踪）
                ctx.fillStyle = 'white';
                ctx.beginPath();
                // 左眼（^）
                ctx.moveTo(this.x - 12 + this.eyeOffset.x * 2, this.y - 1 + this.eyeOffset.y * 2);
                ctx.lineTo(this.x - 8 + this.eyeOffset.x * 2, this.y - 5 + this.eyeOffset.y * 2);
                ctx.lineTo(this.x - 4 + this.eyeOffset.x * 2, this.y - 1 + this.eyeOffset.y * 2);
                // 右眼（^）
                ctx.moveTo(this.x + 4 + this.eyeOffset.x * 2, this.y - 1 + this.eyeOffset.y * 2);
                ctx.lineTo(this.x + 8 + this.eyeOffset.x * 2, this.y - 5 + this.eyeOffset.y * 2);
                ctx.lineTo(this.x + 12 + this.eyeOffset.x * 2, this.y - 1 + this.eyeOffset.y * 2);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                // 绘制普通眼睛
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(this.x - 8 + this.eyeOffset.x * 2, this.y - 7.5 + this.eyeOffset.y * 2, 3.5, 0, Math.PI * 2);
                ctx.arc(this.x + 8 + this.eyeOffset.x * 2, this.y - 7.5 + this.eyeOffset.y * 2, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 显示状态（增加显示高度）
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText(`友好度: ${Math.round(this.friendliness)}`, this.x - 15, this.y - 35);
            ctx.fillText(`侵略性: ${Math.round(this.aggression)}`, this.x - 15, this.y - 27.5);
            ctx.fillText(`活力值: ${Math.round(this.vitality)}`, this.x - 15, this.y - 20);
            ctx.fillText(`模仿点: ${this.imitationPoints.toFixed(1)}`, this.x - 15, this.y - 12.5);
            
            if (this.isStunned) {
                ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
                ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
                ctx.fillStyle = 'yellow';
                ctx.fillText('震慑中...', this.x - 10, this.y - 42.5);
            }
            if (this.isHoldingHands) {
                ctx.fillStyle = 'pink';
                ctx.fillText('牵手中...', this.x - 10, this.y - 50);
            }
            if (this.canSeePlayer) {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
                ctx.fillStyle = 'lime';
                ctx.fillText('看见玩家', this.x - 10, this.y - 57.5);
            } else if (this.targetParticle) {
                ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
                ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
                ctx.fillStyle = 'blue';
                ctx.fillText('追踪蜜蜂', this.x - 10, this.y - 57.5);
            } else {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
                ctx.fillStyle = 'red';
                ctx.fillText('自由行动', this.x - 10, this.y - 57.5);
            }
            
            // 显示当前行为模式
            ctx.fillStyle = 'white';
            if (this.behaviorMode === 'follow') {
                ctx.fillText('跟随模式', this.x - 10, this.y - 65);
            } else if (this.behaviorMode === 'mimic') {
                ctx.fillText('模仿模式', this.x - 10, this.y - 65);
            } else if (this.targetParticle) {
                ctx.fillText('追踪蜜蜂', this.x - 10, this.y - 65);
            } else {
                ctx.fillText('自由模式', this.x - 10, this.y - 65);
            }
        }
    }

    // 根据状态获取颜色
    getColor() {
        const hue = (this.aggression / 100) * 120;
        const saturation = 70;
        const lightness = 50 - (this.vitality / 100) * 20;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    // 显示自发思考
    showSpontaneousThought() {
        // 如果正在追踪球，不显示天气相关的思考
        if (this.isTrackingBall) return;
        
        let thought;
        
        // 50%的概率谈论天气
        if (Math.random() < 0.5 && gameState.weather.emoji) {
            const currentWeather = this.getCurrentWeather();
            const weatherThoughts = this.weatherThoughts[currentWeather];
            if (weatherThoughts && weatherThoughts.length > 0) {
                thought = weatherThoughts[Math.floor(Math.random() * weatherThoughts.length)];
            }
        }
        
        // 如果没有选择天气相关的思考，则从普通思考中随机选择
        if (!thought) {
            const thoughts = [...this.greetingMessages, ...this.philosophicalThoughts];
            thought = thoughts[Math.floor(Math.random() * thoughts.length)];
        }
        
        this.showDialogue(thought);
    }

    // 获取当前天气类型
    getCurrentWeather() {
        const emojiToWeather = {
            '☀️': '晴',
            '⛅': '多云',
            '☁️': '阴',
            '🌧️': '小雨',
            '⛈️': '雷阵雨',
            '🌨️': '小雪',
            '🌫️': '雾'
        };
        
        return emojiToWeather[gameState.weather.emoji] || '晴';
    }

    // 显示对话
    showDialogue(text) {
        const dialogueContainer = document.getElementById('aiResponse');
        const dialogueBubble = document.createElement('div');
        dialogueBubble.className = 'dialogue-bubble';
        
        // 修改对话内容
        if (text === "你好！") {
            text = `我是一个${this.width}x${this.height}的正方体。`;
        }
        
        // 使用打字效果显示文本
        typeText(dialogueBubble, text);
        
        dialogueContainer.appendChild(dialogueBubble);
        
        // 30秒后移除
        setTimeout(() => {
            dialogueBubble.style.opacity = '0';
            dialogueBubble.style.transition = 'opacity 0.5s ease-in-out';
            setTimeout(() => {
                if (dialogueContainer.contains(dialogueBubble)) {
                    dialogueContainer.removeChild(dialogueBubble);
                }
            }, 500);
        }, 30000);
    }

    // 更新你好模式
    updateHelloMode() {
        const now = Date.now();
        
        // 检查是否超过持续时间
        if (now - this.helloModeStartTime > this.helloModeDuration) {
            this.exitHelloMode();
            return;
        }
        
        // 移动到中心（仅X轴）
        if (!this.helloModeActions.movedToCenter) {
            const dx = this.centerX - this.x;
            const distance = Math.abs(dx);
            
            if (distance > 5) {
                // 以0.5倍速度移动
                this.velocityX = (dx / distance) * this.speed * 0.5;
                this.x += this.velocityX;
            } else {
                // 到达中心
                this.helloModeActions.movedToCenter = true;
                this.velocityX = 0;
                
                // 执行跳跃或左右移动
                if (this.observedBehaviors.hasJumped) {
                    this.jump();
                    this.helloModeActions.jumped = true;
                } else {
                    // 快速左右移动
                    this.sideMovementCount = 0;
                    this.startSideMovement();
                }
            }
        } else if (this.helloModeActions.jumped) {
            // 执行第二次跳跃
            if (this.helloModeActions.jumpCount < 2 && !this.isJumping) {
                this.jump();
                this.helloModeActions.jumpCount++;
            }
        }
    }

    // 开始左右移动
    startSideMovement() {
        if (this.helloModeActions.sideMovementCount < 2) {
            // 快速左右移动
            const direction = this.helloModeActions.sideMovementCount % 2 === 0 ? 1 : -1;
            this.velocityX = direction * this.speed * 2;
            
            // 移动一小段距离后改变方向
            setTimeout(() => {
                if (this.helloMode) {
                    this.velocityX = -direction * this.speed * 2;
                    
                    // 再次移动后完成一次左右移动
                    setTimeout(() => {
                        if (this.helloMode) {
                            this.velocityX = 0;
                            this.helloModeActions.sideMovementCount++;
                            
                            // 如果完成两次左右移动，显示"我看到了！"
                            if (this.helloModeActions.sideMovementCount === 2) {
                                this.showDialogue("我看到了！");
                            } else {
                                // 否则开始下一次左右移动
                                this.startSideMovement();
                            }
                        }
                    }, 200);
                }
            }, 200);
        }
    }

    // 进入你好模式
    enterHelloMode() {
        this.helloMode = true;
        this.helloModeStartTime = Date.now();
        this.helloModeActions = {
            movedToCenter: false,
            jumped: false,
            jumpCount: 0,
            sideMovementCount: 0
        };
        this.showDialogue("你好！");
    }

    // 退出你好模式
    exitHelloMode() {
        this.helloMode = false;
        this.velocityX = 0;
        this.velocityY = 0;
        this.showDialogue("再见！");
    }
}

// 玩家角色类
class PlayerCharacter {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.collisionWidth = 60;
        this.collisionHeight = 60;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.isCrouching = false;
        this.speed = 10;
        this.baseSpeed = 5;
        this.jumpForce = -12;
        this.gravity = 0.6;
        this.bounce = 0.5;
        this.crouchHeight = 20;
        this.normalHeight = 40;
        this.isHoldingHands = false;
        this.canMove = true; // 添加移动控制标志
    }
    
    update() {
        if (!this.canMove) return; // 如果移动被禁用，直接返回

        // 应用重力
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        
        // 地面碰撞检测
        if (this.y + this.height/2 > gameState.canvas.height) {
            this.y = gameState.canvas.height - this.height/2;
            this.velocityY = 0;
            this.isJumping = false;
        }
        
        // 边界碰撞检测
        if (this.x - this.width/2 < 0) {
            this.x = this.width/2;
            this.velocityX *= -this.bounce;
        }
        if (this.x + this.width/2 > gameState.canvas.width) {
            this.x = gameState.canvas.width - this.width/2;
            this.velocityX *= -this.bounce;
        }
        
        // 更新位置
        this.x += this.velocityX;
    }
    
    draw(ctx) {
        // 绘制玩家角色
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }
}

// 碰撞检测
function checkCollision(obj1, obj2) {
    const dx = Math.abs(obj1.x - obj2.x);
    const dy = Math.abs(obj1.y - obj2.y);
    const minX = (obj1.collisionWidth + obj2.collisionWidth) / 2;
    const minY = (obj1.collisionHeight + obj2.collisionHeight) / 2;
    return dx < minX && dy < minY;
}

// 处理碰撞
function handleCollision(player, ai) {
    if (checkCollision(player, ai)) {
        const dx = player.x - ai.x;
        const dy = player.y - ai.y;
        const angle = Math.atan2(dy, dx);
        
        const targetX = ai.x + Math.cos(angle) * (player.collisionWidth + ai.collisionWidth) / 2;
        const targetY = ai.y + Math.sin(angle) * (player.collisionHeight + ai.collisionHeight) / 2;
        
        const ax = (targetX - player.x) * 0.1;
        const ay = (targetY - player.y) * 0.1;
        
        player.velocityX += ax;
        player.velocityY += ay;
        ai.velocityX -= ax;
        ai.velocityY -= ay;
    }
}

// 生成地形数据
function generateTerrain() {
    const terrainPoints = [];
    const segmentWidth = 50; // 每段地形的宽度
    const numSegments = Math.ceil(gameState.canvas.width / segmentWidth);
    const baseHeight = gameState.canvas.height - 50; // 基础高度
    
    for (let i = 0; i <= numSegments; i++) {
        const x = i * segmentWidth;
        // 使用正弦函数生成平滑的起伏，振幅控制在10像素内
        const heightVariation = Math.sin(i * 0.5) * 10;
        terrainPoints.push({
            x: x,
            y: baseHeight + heightVariation
        });
    }
    
    return terrainPoints;
}

// 绘制地形
function drawTerrain(ctx, terrainPoints) {
    ctx.beginPath();
    ctx.moveTo(0, gameState.canvas.height);
    ctx.lineTo(terrainPoints[0].x, terrainPoints[0].y);
    
    for (let i = 1; i < terrainPoints.length; i++) {
        ctx.lineTo(terrainPoints[i].x, terrainPoints[i].y);
    }
    
    ctx.lineTo(gameState.canvas.width, gameState.canvas.height);
    ctx.closePath();
    ctx.fillStyle = '#8B4513'; // 棕色地面
    ctx.fill();
}

// 与DeepSeek对话
async function talkToDeepSeek(input) {
    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-0b6b4dc0dc0c4a1982324701f0e3be87'
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "你是一个冷静的AI，使用'你'来称呼玩家，用'我'来称呼自己。保持理性、客观的语气。"
                    },
                    {
                        role: "user",
                        content: input
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('DeepSeek API 错误:', error);
        return `抱歉，我现在无法回应。错误信息: ${error.message}`;
    }
}

// 获取天气emoji
function getWeatherEmoji(weather) {
    const weatherMap = {
        '晴': '☀️',
        '多云': '⛅',
        '阴': '☁️',
        '小雨': '🌧️',
        '中雨': '🌧️',
        '大雨': '🌧️',
        '暴雨': '⛈️',
        '雷阵雨': '⛈️',
        '小雪': '🌨️',
        '中雪': '🌨️',
        '大雪': '🌨️',
        '雾': '🌫️',
        '霾': '🌫️'
    };
    return weatherMap[weather] || '☀️';
}

// 获取天气信息
async function getWeather() {
    try {
        const response = await fetch(`https://restapi.amap.com/v3/ip?key=8301280a7c09cc9d290651788640760f`);
        const data = await response.json();
        
        if (data.status === '1') {
            const weatherResponse = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=8301280a7c09cc9d290651788640760f&city=${data.adcode}`);
            const weatherData = await weatherResponse.json();
            
            if (weatherData.status === '1' && weatherData.lives && weatherData.lives.length > 0) {
                const weather = weatherData.lives[0].weather;
                gameState.weather.emoji = getWeatherEmoji(weather);
                gameState.weather.lastUpdate = Date.now();
            }
        }
    } catch (error) {
        console.error('获取天气信息失败:', error);
    }
}

// 初始化游戏
function initGame() {
    // 设置画布上下文
    gameState.ctx = gameState.canvas.getContext('2d');
    
    // 创建AI角色
    gameState.ai = new AICharacter(100, 100);
    
    // 创建玩家角色
    gameState.player = new PlayerCharacter(300, 100);
    
    // 获取天气信息
    getWeather();
    
    // 初始化语音识别
    initVoiceRecognition();
    startVoiceRecognition();
    
    // 开始游戏循环
    gameLoop();
}

// 游戏主循环
function gameLoop() {
    // 清除画布
    gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    // 检查是否需要更新天气
    if (Date.now() - gameState.weather.lastUpdate > gameState.weather.updateInterval) {
        getWeather();
    }
    
    // 绘制天气emoji
    if (gameState.weather.emoji) {
        gameState.ctx.font = '30px Arial';
        gameState.ctx.fillStyle = 'white';
        gameState.ctx.fillText(gameState.weather.emoji, gameState.canvas.width - 50, 40);
    }
    
    // 更新和绘制AI
    gameState.ai.update();
    gameState.ai.draw(gameState.ctx);
    
    // 更新和绘制玩家
    gameState.player.update();
    gameState.player.draw(gameState.ctx);
    
    // 更新和绘制粒子
    updateParticles();
    drawParticles(gameState.ctx);
    
    // 检查粒子捕获
    checkParticleCapture();
    
    // 检测碰撞
    handleCollisions();
    
    // 添加透明正方形
    const hoverSquare = {
        x: gameState.canvas.width - 40,
        y: 0,
        width: 40,
        height: 40,
        isHovered: false,
        hoverStartTime: 0,
        event1Completed: false,
        event2Completed: false,
        eventStartTime: 0,
        currentEvent: null,
        dialogueIndex: 0,
        dialogues: [
            "嘿",
            `今天是${gameState.weather.emoji}的天气`,
            "我想给你看这个"
        ],
        emojiFallInterval: null,
        emojiFallDuration: 5000,
        emojiFallStartTime: 0,
        lastTriggerTime: 0,  // 添加最后触发时间
        cooldownDuration: 10000  // 10秒冷却时间
    };

    // 添加鼠标移动事件监听
    gameState.canvas.addEventListener('mousemove', (e) => {
        const rect = gameState.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 更新鼠标位置日志
        const logArea = document.getElementById('logArea');
        const mouseLog = document.getElementById('mouseLog') || document.createElement('p');
        mouseLog.id = 'mouseLog';
        
        // 检查是否在触发区域内
        const isInTriggerArea = x >= hoverSquare.x && x <= gameState.canvas.width &&
                              y >= hoverSquare.y && y <= hoverSquare.height;
        
        // 计算剩余冷却时间
        const currentTime = Date.now();
        const timeSinceLastTrigger = currentTime - hoverSquare.lastTriggerTime;
        const remainingCooldown = Math.max(0, hoverSquare.cooldownDuration - timeSinceLastTrigger);
        
        // 更新日志显示
        let logText = `鼠标位置: X=${Math.round(x)}, Y=${Math.round(y)}`;
        if (remainingCooldown > 0) {
            logText += ` (冷却中: ${Math.ceil(remainingCooldown/1000)}秒)`;
        }
        mouseLog.textContent = logText;
        mouseLog.style.color = isInTriggerArea ? 'red' : 'white';
        
        if (!document.getElementById('mouseLog')) {
            logArea.insertBefore(mouseLog, logArea.firstChild);
        }

        // 当进入触发区域且不在冷却时间内时，检查事件
        if (isInTriggerArea && timeSinceLastTrigger >= hoverSquare.cooldownDuration && !hoverSquare.isHovered) {
            hoverSquare.isHovered = true;
            if (!hoverSquare.event1Completed) {
                handleEvent1();
                hoverSquare.event1Completed = true; // 确保事件1只触发一次
                hoverSquare.lastTriggerTime = currentTime;
            } else if (Date.now() - hoverSquare.eventStartTime >= 5000) {
                handleEvent2();
                hoverSquare.lastTriggerTime = currentTime;
            }
        } else if (!isInTriggerArea) {
            hoverSquare.isHovered = false;
        }
    });

    // 处理事件1
    function handleEvent1() {
        if (!hoverSquare.event1Completed) {
            hoverSquare.event1Completed = true;
            hoverSquare.currentEvent = 'event1';
            hoverSquare.eventStartTime = Date.now();
            hoverSquare.dialogueIndex = 0;
            
            // 禁用玩家操作和AI自言自语
            gameState.player.canMove = false;
            gameState.ai.canThink = false;
            
            // 开始移动AI到玩家位置
            const moveInterval = setInterval(() => {
                if (gameState.ai.canSeePlayer) {
                    clearInterval(moveInterval);
                    gameState.ai.behaviorMode = 'follow';
                    // 开始显示对话
                    showNextDialogue();
                } else {
                    const dx = gameState.player.x - gameState.ai.x;
                    const distance = Math.abs(dx);
                    if (distance > 5) {
                        gameState.ai.velocityX = (dx / distance) * gameState.ai.speed;
                    }
                }
            }, 1000 / 60);
        }
    }

    // 显示下一段对话
    function showNextDialogue() {
        if (hoverSquare.dialogueIndex < hoverSquare.dialogues.length) {
            // 清除之前的对话
            const dialogueContainer = document.getElementById('aiResponse');
            dialogueContainer.innerHTML = '';
            
            // 显示新对话
            gameState.ai.showDialogue(hoverSquare.dialogues[hoverSquare.dialogueIndex]);
            hoverSquare.dialogueIndex++;
            
            if (hoverSquare.dialogueIndex === hoverSquare.dialogues.length) {
                // 所有对话显示完毕，开始表情雨
                gameState.ai.specialEyes = true;
                startEmojiFall();
            } else {
                // 2秒后显示下一段对话
                setTimeout(showNextDialogue, 2000);
            }
        }
    }

    // 处理事件2
    function handleEvent2() {
        if (hoverSquare.event1Completed && !hoverSquare.event2Completed) {
            hoverSquare.event2Completed = true;
            hoverSquare.currentEvent = 'event2';
            hoverSquare.eventStartTime = Date.now();
            
            // 禁用玩家操作和AI自言自语
            gameState.player.canMove = false;
            gameState.ai.canThink = false;
            
            // 清除之前的对话
            const dialogueContainer = document.getElementById('aiResponse');
            dialogueContainer.innerHTML = '';
            
            // 显示对话并开始表情雨
            gameState.ai.showDialogue("你还想再来一次吗？");
            gameState.ai.specialEyes = true;
            startEmojiFall();
        }
    }

    // 开始表情雨
    function startEmojiFall() {
        hoverSquare.emojiFallStartTime = Date.now();
        hoverSquare.emojiFallInterval = setInterval(() => {
            const emoji = gameState.weather.emoji;
            const x = Math.random() * gameState.canvas.width;
            const y = 0;
            const speed = 2 + Math.random() * 3;
            
            const fallingEmoji = {
                x: x,
                y: y,
                speed: speed,
                emoji: emoji
            };
            
            gameState.fallingEmojis = gameState.fallingEmojis || [];
            gameState.fallingEmojis.push(fallingEmoji);
            
            if (Date.now() - hoverSquare.emojiFallStartTime >= hoverSquare.emojiFallDuration) {
                clearInterval(hoverSquare.emojiFallInterval);
                endEvent();
            }
        }, 500); // 增加间隔时间，使表情雨更稀疏
    }

    // 结束事件
    function endEvent() {
        gameState.ai.specialEyes = false;
        gameState.ai.behaviorMode = 'free';
        gameState.player.canMove = true;
        gameState.ai.canThink = true;
        hoverSquare.currentEvent = null;
        gameState.fallingEmojis = [];
    }

    // 更新和绘制下落的表情
    if (gameState.fallingEmojis) {
        gameState.fallingEmojis = gameState.fallingEmojis.filter(emoji => {
            emoji.y += emoji.speed;
            gameState.ctx.font = '20px Arial';
            gameState.ctx.fillText(emoji.emoji, emoji.x, emoji.y);
            return emoji.y < gameState.canvas.height;
        });
    }

    // 绘制悬停正方形
    gameState.ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    gameState.ctx.fillRect(hoverSquare.x, hoverSquare.y, hoverSquare.width, hoverSquare.height);

    // 更新和绘制黄色圆形
    if (gameState.yellowCircle) {
        gameState.yellowCircle.update();
        gameState.yellowCircle.draw(gameState.ctx);
    }

    requestAnimationFrame(gameLoop);
}

// 处理碰撞
function handleCollisions() {
    if (gameState.ai && gameState.player) {
        handleCollision(gameState.player, gameState.ai);
    }
}

// 键盘事件处理
window.addEventListener('keydown', (e) => {
    gameState.keys[e.key] = true;
    const player = gameState.player;
    
    if (e.key === 'ArrowUp' && !player.isJumping && player.canMove) {
        player.velocityY = player.jumpForce;
        player.isJumping = true;
        player.isCrouching = false;
        player.height = player.normalHeight;
    } else if (e.key === 'ArrowDown' && !player.isCrouching && player.canMove) {
        player.isCrouching = true;
        player.height = player.crouchHeight;
        player.isJumping = false;
    } else if (e.key === 'q' && gameState.ai) {
        gameState.audio.horn.currentTime = 0;
        gameState.audio.horn.play();
        gameState.ai.stun();
    } else if (e.key === 'e' && gameState.ai) {
        const dx = player.x - gameState.ai.x;
        const dy = player.y - gameState.ai.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (player.isHoldingHands && gameState.ai.isHoldingHands) {
            gameState.ai.releaseHands();
            player.isHoldingHands = false;
            addLog('玩家松开了手');
        }
        else if (distance < 100 && !player.isHoldingHands) {
            gameState.ai.holdHands();
            player.isHoldingHands = true;
        }
    } else if (e.key === '1' && !gameState.yellowCircle) {
        // 在画面中心创建黄色圆形
        gameState.yellowCircle = new YellowCircle(
            gameState.canvas.width / 2,
            0
        );
    } else if (e.key === 's' && gameState.yellowCircle) {
        const circle = gameState.yellowCircle;
        const dx = player.x - circle.x;
        const dy = player.y - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (circle.isHeld) {
            // 记录S键按下时间
            gameState.sKeyPressStartTime = Date.now();
            circle.showDirectionArrows = true;
            player.canMove = false; // 禁用玩家移动
        } else if (distance < 30) {
            circle.isHeld = true;
            circle.holder = player;
        }
    } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && gameState.yellowCircle && gameState.yellowCircle.showDirectionArrows) {
        // 恢复玩家移动
        player.canMove = true;
        // 抛出圆形
        gameState.yellowCircle.throw(e.key === 'ArrowLeft' ? 'left' : 'right');
    }
});

window.addEventListener('keyup', (e) => {
    gameState.keys[e.key] = false;
    const player = gameState.player;
    
    if (e.key === 'ArrowDown') {
        player.isCrouching = false;
        player.height = player.normalHeight;
    } else if (e.key === 's' && gameState.yellowCircle && gameState.yellowCircle.isHeld) {
        const pressDuration = Date.now() - gameState.sKeyPressStartTime;
        if (pressDuration < gameState.sKeyLongPressThreshold) {
            // 短按，向上抛出
            gameState.yellowCircle.throw('up');
            player.canMove = true; // 恢复玩家移动
        }
    }
});

// 持续检查按键状态
setInterval(() => {
    const player = gameState.player;
    const ai = gameState.ai;
    
    if (gameState.keys['ArrowLeft']) {
        if (player.isHoldingHands && ai && ai.isHoldingHands) {
            if (ai.lastActiveDirection < 0) {
                player.speed = player.baseSpeed * 1.2;
            } else if (ai.lastActiveDirection > 0) {
                player.speed = player.baseSpeed * 0.8;
            } else {
                player.speed = player.baseSpeed;
            }
        } else {
            player.speed = player.baseSpeed;
        }
        player.velocityX = -player.speed;
    } else if (gameState.keys['ArrowRight']) {
        if (player.isHoldingHands && ai && ai.isHoldingHands) {
            if (ai.lastActiveDirection > 0) {
                player.speed = player.baseSpeed * 1.2;
            } else if (ai.lastActiveDirection < 0) {
                player.speed = player.baseSpeed * 0.8;
            } else {
                player.speed = player.baseSpeed;
            }
        } else {
            player.speed = player.baseSpeed;
        }
        player.velocityX = player.speed;
    } else {
        player.velocityX *= 0.8;
        player.speed = player.baseSpeed;
    }
}, 1000 / 60);

// 事件处理
document.getElementById('interactButton').addEventListener('click', () => {
    initGestureDetection();
});

document.getElementById('feedButton').addEventListener('click', () => {
    if (gameState.ai) {
        gameState.ai.vitality = Math.min(100, gameState.ai.vitality + 20);
        gameState.ai.aggression = Math.max(0, gameState.ai.aggression - 10);
        gameState.ai.friendliness = Math.min(100, gameState.ai.friendliness + 15);
        gameState.ai.learn('feed');
        addLog('玩家喂食AI角色');
    }
});

document.getElementById('talkButton').addEventListener('click', () => {
    aiSpeak();
});

// 添加日志
function addLog(message) {
    const logArea = document.getElementById('logArea');
    const logEntry = document.createElement('p');
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logArea.appendChild(logEntry);
    logArea.scrollTop = logArea.scrollHeight;
}

// 让AI发言
async function aiSpeak() {
    const chatInput = document.getElementById('chatInput');
    const playerInput = chatInput.value.trim();
    
    if (playerInput) {
        // 清空输入框
        chatInput.value = '';
        
        // 设置AI为思考状态
        gameState.ai.isThinking = true;
        gameState.ai.thinkingStartTime = Date.now();
        
        // 显示"思考中"消息
        gameState.ai.showDialogue("让我相信想想怎么答复你...");
        
        try {
            // 调用DeepSeek API
            const response = await talkToDeepSeek(playerInput);
            
            // 显示回复
            gameState.ai.showDialogue(response);
            
            // 5秒后恢复行为
            setTimeout(() => {
                gameState.ai.isThinking = false;
            }, 5000);
            
            // 播放聊天音效
            gameState.audio.chat.play();
        } catch (error) {
            console.error('对话错误:', error);
            gameState.ai.showDialogue('抱歉，我现在无法回应。');
            gameState.ai.isThinking = false;
        }
    }
}

// 打字效果函数
function typeText(element, text, speed = 30) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// 粒子类
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 4;
        this.velocityX = (Math.random() - 0.5) * 2;
        this.velocityY = (Math.random() - 0.5) * 2;
        this.isCaptured = false;
        this.captureTime = 0;
    }

    update() {
        if (this.isCaptured) return;

        // 更新位置
        this.x += this.velocityX;
        this.y += this.velocityY;

        // 边界碰撞检测
        if (this.x < 0 || this.x > gameState.canvas.width) {
            this.velocityX *= -1;
        }
        if (this.y < 0 || this.y > gameState.canvas.height) {
            this.velocityY *= -1;
        }
    }

    draw(ctx) {
        if (this.isCaptured) return;
        
        ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }
}

// 生成新粒子
function spawnParticle() {
    if (gameState.particles.length < 2) { // 最多2个粒子
        const x = Math.random() * gameState.canvas.width;
        const y = Math.random() * (gameState.canvas.height - 100);
        gameState.particles.push(new Particle(x, y));
    }
}

// 检查粒子捕获
function checkParticleCapture() {
    const player = gameState.player;
    const ai = gameState.ai;

    // 检查玩家捕获
    if (gameState.keys['w']) {
        gameState.particles.forEach(particle => {
            if (!particle.isCaptured) {
                const dx = player.x - particle.x;
                const dy = player.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 30) { // 捕获距离
                    particle.isCaptured = true;
                    particle.captureTime = Date.now();
                    player.vitality = Math.min(100, player.vitality + 10);
                    addLog('玩家捕获了一个蜂蜜粒子！');
                }
            }
        });
    }

    // 检查AI捕获
    if (ai.observedBehaviors.hasJumped && !ai.isJumping) {
        gameState.particles.forEach(particle => {
            if (!particle.isCaptured) {
                const dx = ai.x - particle.x;
                const dy = ai.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 30) { // 捕获距离
                    particle.isCaptured = true;
                    particle.captureTime = Date.now();
                    ai.vitality = Math.min(100, ai.vitality + 10);
                    addLog('AI捕获了一个蜂蜜粒子！');
                }
            }
        });
    }
}

// 更新粒子系统
function updateParticles() {
    // 生成新粒子
    if (Date.now() - gameState.lastParticleSpawnTime > gameState.particleSpawnInterval) {
        spawnParticle();
        gameState.lastParticleSpawnTime = Date.now();
    }

    // 更新现有粒子
    gameState.particles = gameState.particles.filter(particle => {
        if (particle.isCaptured && Date.now() - particle.captureTime > 1000) {
            return false; // 移除被捕获超过1秒的粒子
        }
        particle.update();
        return true;
    });
}

// 绘制粒子
function drawParticles(ctx) {
    gameState.particles.forEach(particle => particle.draw(ctx));
}

// 初始化手势检测
async function initGestureDetection() {
    if (!gameState.gestureDetection.isActive) {
        try {
            // 请求摄像头权限
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 320,
                    height: 240,
                    facingMode: 'user'
                } 
            });
            
            gameState.gestureDetection.video.srcObject = stream;
            gameState.gestureDetection.ctx = gameState.gestureDetection.canvas.getContext('2d');
            gameState.gestureDetection.container.style.display = 'block';
            
            // 显示初始提示
            gameState.ai.showDialogue("请把手打开举到摄像头前 :)");
            
            // 加载TensorFlow.js和handpose模型
            await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
            await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/handpose');
            
            // 初始化模型
            gameState.gestureDetection.model = await handpose.load();
            gameState.gestureDetection.isActive = true;
            
            // 开始检测循环
            detectGestures();
            
            addLog('手势检测已启动');
        } catch (error) {
            console.error('手势检测初始化失败:', error);
            addLog('手势检测初始化失败: ' + error.message);
        }
    } else {
        // 关闭手势检测
        const stream = gameState.gestureDetection.video.srcObject;
        stream.getTracks().forEach(track => track.stop());
        gameState.gestureDetection.container.style.display = 'none';
        gameState.gestureDetection.isActive = false;
        addLog('手势检测已关闭');
    }
}

// 加载外部脚本
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// 检测手势
async function detectGestures() {
    if (!gameState.gestureDetection.isActive) return;
    
    const video = gameState.gestureDetection.video;
    const canvas = gameState.gestureDetection.canvas;
    const ctx = gameState.gestureDetection.ctx;
    
    // 设置canvas尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 检测手部
    const predictions = await gameState.gestureDetection.model.estimateHands(video);
    
    // 清除canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (predictions.length > 0) {
        // 绘制手部关键点
        ctx.fillStyle = 'red';
        predictions.forEach(prediction => {
            prediction.landmarks.forEach(landmark => {
                ctx.beginPath();
                ctx.arc(landmark[0], landmark[1], 5, 0, 2 * Math.PI);
                ctx.fill();
            });
            
            // 检测手势
            const gesture = detectGestureType(prediction.landmarks);
            if (gesture) {
                handleGesture(gesture);
            }
        });
    }
    
    // 继续检测循环
    requestAnimationFrame(detectGestures);
}

// 检测手势类型
function detectGestureType(landmarks) {
    // 计算手指是否伸展
    const fingerTips = [8, 12, 16, 20]; // 食指、中指、无名指、小指的指尖
    const fingerBases = [5, 9, 13, 17]; // 对应的指根
    
    let extendedFingers = 0;
    fingerTips.forEach((tip, index) => {
        if (landmarks[tip][1] < landmarks[fingerBases[index]][1]) {
            extendedFingers++;
        }
    });
    
    // 检测招手手势（手掌张开并且左右晃动）
    if (extendedFingers >= 4) { // 手掌张开
        // 获取手腕和手掌中心点
        const wrist = landmarks[0];
        const palmCenter = landmarks[9];
        
        // 计算手掌方向
        const palmDirection = Math.atan2(palmCenter[1] - wrist[1], palmCenter[0] - wrist[0]);
        
        // 记录手势历史
        const now = Date.now();
        gameState.ai.waveGestureHistory.push({
            time: now,
            direction: palmDirection
        });
        
        // 清理旧的手势记录
        gameState.ai.waveGestureHistory = gameState.ai.waveGestureHistory.filter(
            gesture => now - gesture.time < gameState.ai.waveGestureTimeWindow
        );
        
        // 检测左右晃动
        if (gameState.ai.waveGestureHistory.length >= 3) {
            let directionChanges = 0;
            for (let i = 1; i < gameState.ai.waveGestureHistory.length; i++) {
                const prevGesture = gameState.ai.waveGestureHistory[i-1];
                const currGesture = gameState.ai.waveGestureHistory[i];
                
                // 如果方向变化超过阈值，计数
                if (Math.abs(currGesture.direction - prevGesture.direction) > 0.5) {
                    directionChanges++;
                }
            }
            
            // 如果检测到足够的晃动次数，触发招手手势
            if (directionChanges >= gameState.ai.waveGestureThreshold) {
                return 'wave';
            }
        }
    }
    
    // 检测食指指向方向
    if (extendedFingers === 1) {
        // 获取食指指尖和手腕位置
        const indexTip = landmarks[8];
        const wrist = landmarks[0];
        
        // 计算食指相对于手腕的角度
        const dx = indexTip[0] - wrist[0];
        const dy = indexTip[1] - wrist[1];
        const angle = Math.atan2(dx, -dy) * (180 / Math.PI); // 转换为角度
        
        // 判断左右方向（以30度为阈值）
        if (angle > 30) {
            return 'point_right';
        } else if (angle < -30) {
            return 'point_left';
        }
        
        return 'point';
    }
    
    // 根据伸展的手指数量判断手势
    if (extendedFingers === 0) return 'fist';
    if (extendedFingers === 2) return 'peace';
    if (extendedFingers === 4) return 'open';
    return null;
}

// 处理检测到的手势
function handleGesture(gesture) {
    const player = gameState.player;
    
    switch (gesture) {
        case 'wave':
            // 触发AI的你好模式
            if (gameState.ai && !gameState.ai.helloMode) {
                gameState.ai.enterHelloMode();
            }
            break;
        case 'fist':
            // 蹲下
            if (!player.isCrouching) {
                player.isCrouching = true;
                player.height = player.crouchHeight;
                player.isJumping = false;
            }
            break;
        case 'point':
            // 跳跃
            if (!player.isJumping) {
                player.velocityY = player.jumpForce;
                player.isJumping = true;
                player.isCrouching = false;
                player.height = player.normalHeight;
            }
            break;
        case 'point_left':
            // 向左移动
            player.velocityX = player.speed;
            break;
        case 'point_right':
            // 向右移动
            player.velocityX = -player.speed;
            break;
        case 'peace':
            // 牵手
            if (gameState.ai && !player.isHoldingHands) {
                const dx = player.x - gameState.ai.x;
                const dy = player.y - gameState.ai.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    gameState.ai.holdHands();
                    player.isHoldingHands = true;
                }
            }
            break;
        case 'open':
            // 松开手
            if (player.isHoldingHands && gameState.ai) {
                gameState.ai.releaseHands();
                player.isHoldingHands = false;
            }
            break;
    }
}

// 初始化语音识别
function initVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        console.error('您的浏览器不支持语音识别功能');
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false; // 改为只识别一次
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript.trim();
        
        if (transcript === '启动' && !gameState.gestureDetection.isActive) {
            addLog('语音识别成功：检测到"启动"指令');
            initGestureDetection();
            stopVoiceRecognition(); // 识别成功后停止语音识别
        }
    };

    recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        addLog(`语音识别错误: ${event.error}`);
    };

    gameState.voiceRecognition.recognition = recognition;
}

// 启动语音识别
function startVoiceRecognition() {
    if (gameState.voiceRecognition.recognition) {
        gameState.voiceRecognition.isActive = true;
        gameState.voiceRecognition.recognition.start();
    }
}

// 停止语音识别
function stopVoiceRecognition() {
    if (gameState.voiceRecognition.recognition) {
        gameState.voiceRecognition.isActive = false;
        gameState.voiceRecognition.recognition.stop();
    }
}

// 黄色圆形类
class YellowCircle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 7.5;
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 0.6;
        this.bounce = 0.5;
        this.isHeld = false;
        this.holder = null;
        this.showDirectionArrows = false; // 添加方向箭头显示状态
    }

    update() {
        if (this.isHeld) {
            if (this.holder) {
                this.x = this.holder.x;
                this.y = this.holder.y - 20; // 在玩家头顶上方
            }
            return;
        }

        // 应用重力
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // 地面碰撞检测
        if (this.y + this.radius > gameState.canvas.height) {
            this.y = gameState.canvas.height - this.radius;
            this.velocityY = -this.velocityY * this.bounce;
        }

        // 边界碰撞检测
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.velocityX *= -this.bounce;
        }
        if (this.x + this.radius > gameState.canvas.width) {
            this.x = gameState.canvas.width - this.radius;
            this.velocityX *= -this.bounce;
        }

        // 更新位置
        this.x += this.velocityX;
    }

    draw(ctx) {
        // 绘制圆形
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();

        // 如果显示方向箭头，绘制左右箭头
        if (this.showDirectionArrows && this.holder) {
            const arrowSize = 20;
            const arrowOffset = 30;
            
            // 左箭头
            ctx.beginPath();
            ctx.moveTo(this.holder.x - arrowOffset - arrowSize, this.holder.y);
            ctx.lineTo(this.holder.x - arrowOffset, this.holder.y - arrowSize/2);
            ctx.lineTo(this.holder.x - arrowOffset, this.holder.y + arrowSize/2);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fill();

            // 右箭头
            ctx.beginPath();
            ctx.moveTo(this.holder.x + arrowOffset + arrowSize, this.holder.y);
            ctx.lineTo(this.holder.x + arrowOffset, this.holder.y - arrowSize/2);
            ctx.lineTo(this.holder.x + arrowOffset, this.holder.y + arrowSize/2);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fill();
        }
    }

    throw(direction = 'up') {
        this.isHeld = false;
        this.holder = null;
        this.showDirectionArrows = false;
        this.ballPickupAttempted = false; // 重置拾取尝试状态
        
        const throwSpeed = 10;
        switch(direction) {
            case 'up':
                this.velocityX = 0;
                this.velocityY = -throwSpeed;
                break;
            case 'left':
                this.velocityX = -throwSpeed;
                this.velocityY = -throwSpeed/2;
                break;
            case 'right':
                this.velocityX = throwSpeed;
                this.velocityY = -throwSpeed/2;
                break;
        }
    }
}

// 初始化游戏并启动
initGame();
gameLoop();

// 添加聊天输入框事件监听
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    
    // 点击发送按钮
    chatSendBtn.addEventListener('click', aiSpeak);
    
    // 按回车键发送
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            aiSpeak();
        }
    });
}); 