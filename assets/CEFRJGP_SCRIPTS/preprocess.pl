# 同一ディレクトリ内にある任意テキストデータ(.txt)を対象に前処理をするスクリプト
# last modifiled: 2/23/2020
# usage: perl preprocess.pl

# 次のUTF8関連の処理はうまくいっていない
use utf8;
binmode STDIN, ":utf8";
binmode STDOUT, ":utf8";

# 処理済ファイルを出力するフォルダを作成
if (!-d ".\\preprocessed"){
	mkdir ".\\preprocessed";
}

@files = glob "*.txt";
foreach $filein (@files) {
	$fileout = $filein;
	open(IN, $filein);
	open (OUT, ">preprocessed\\$fileout");
	while (<IN>) {
		chomp;
		$line = $_;
		# &・<・>はTreeTagger処理時に問題があるので最後の段階で置換する
		$line =~ s/[“”]/"/g;
		$line =~ s/[‘’`]/'/g;
		$line =~ s/，/, /g;
		$line =~ s/：/: /g;
		$line =~ s/…/ .../g;
		$line =~ s/[　\t]/ /g;
		$line =~ s/[～~]/.../g;
		print OUT $line . "\n";
	}
	close (IN);
	close (OUT);
}

exit (0);
