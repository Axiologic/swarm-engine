$$.swarms.describe("echo",{
    say: function(input){
        this.return("Echo "+ input);
    }
});

$$.swarms.describe("notifier",{
    init: function(encryptedSeed){
        this.encryptedSeed = encryptedSeed;
    }
});

