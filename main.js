const { createApp } = Vue;

createApp({
    data() {
        return {
            baseStat: 0,
            skillRatio: 0,
            em: 0,
            reactionType: "none",
            reactionBonus: 0,
            elementBonus: 0,
            resistance: 0,
            charLevel: 1,
            enemyLevel: 1,
            defReduction: 0,
            defIgnore: 0,
            critRate: 0,
            critDmg: 0,
            independentBonus: 0,
            reactionCoefBonus: 0,
            showResult: false,
            normalDmg: 0,
            critDmgVal: 0,
            expectedDmg: 0,
            baseDmgBonus: 0,
        }
    },
    methods: {
        getBaseReactionMultiplier() {
            switch (this.reactionType) {
                case "melt_pyro": return 2;
                case "melt_cryo": return 1.5;
                case "vaporize_hydro": return 2;
                case "vaporize_pyro": return 1.5;
                default: return 1;
            }
        },
        calc() {
            // 1. 基础伤害值
            const independentZone = (this.independentBonus) / 100 == 0 ? 1 : (this.independentBonus) / 100;
            const baseDmg = this.baseStat * (this.skillRatio / 100) * independentZone + (this.baseDmgBonus || 0);

            // 2. 元素反应倍率
            const baseReaction = this.getBaseReactionMultiplier();
            const emBonus = this.em > 0 ? 2.78 * this.em / (this.em + 1400) : 0;
            const reactionBonus = this.reactionBonus / 100;
            const reactionCoefBonus = 1 + (this.reactionCoefBonus || 0) / 100;
            const reactionMultiplier = baseReaction * (1 + emBonus + reactionBonus) * reactionCoefBonus;

            // 3. 增伤区
            const bonusZone = 1 + this.elementBonus / 100;

            // 4. 抗性区
            let resistanceZone = 1;
            if (this.resistance < 0) {
                resistanceZone = 1 - this.resistance / 200;
            } else if (this.resistance <= 75) {
                resistanceZone = 1 - this.resistance / 100;
            } else {
                resistanceZone = 1 / (1 + 4 * (this.resistance / 100));
            }

            // 5. 防御区
            const charLv = this.charLevel;
            const enemyLv = this.enemyLevel;
            const defRed = 1 - this.defReduction / 100;
            const defIgn = 1 - this.defIgnore / 100;
            const defenseZone = (charLv + 100) / ((charLv + 100) + (enemyLv + 100) * defRed * defIgn);

            // 6. 暴击伤害区
            const critRate = Math.min(Math.max(this.critRate / 100, 0), 1);
            const critDmgZone = 1 + this.critDmg / 100;

            // 7. 计算
            const normal = baseDmg * reactionMultiplier * bonusZone * resistanceZone * defenseZone * 1;
            const crit = baseDmg * reactionMultiplier * bonusZone * resistanceZone * defenseZone * critDmgZone;
            const expected = normal * (1 - critRate) + crit * critRate;

            this.normalDmg = normal;
            this.critDmgVal = crit;
            this.expectedDmg = expected;
            this.showResult = true;
        }
    }
}).mount('#app'); 