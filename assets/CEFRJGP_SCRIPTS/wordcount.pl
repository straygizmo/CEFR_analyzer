# 同一ディレクトリ内にあるXML形式に変換したPOSタグ・レマ付きデータ(*.xml)の語数を計算するスクリプト
# last modified: 2/23/2020
# usage: perl wordcount.pl

open (OUT, ">wordcount.txt");

@files = glob "*.xml";
foreach $filename (@files){
	open (IN, "$filename");

	$i = 0;
	while (<IN>) {
		if (/^</) {
			next;
		} else {
			while (/([^_ ]+)_([^_ ]+)_([^_ ]+)/g) {
				$word = $1;
				$pos = $2;
				$lemma = $3;
				unless ($pos =~ /^(POS|SENT|,|:|``|''|\(|\)|#|\$)$/) {	# POSは所有格の's・SENT（.!?）・その他の句読点
					$i++;
				}
			}
		}
	}

	print OUT "$filename: " . $i." words\n";
	close (IN);
}

close (OUT);

exit(0);
