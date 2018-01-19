#include<iostream>
#include<sstream>
#include<fstream>
#include<map>
#include<set>
#include<vector>
using namespace std;
int V[5000000];
int E[100000000];
int Vnext[5000000];
int Vy[5000000];
int Ey[100000000];
int Vynext[5000000];
int main(int argc, char* argv[]){
	//if(argc != 2)cout << "argsize error: " << argc <<  endl;
	string word;
	ifstream pagezero("pagezero.txt");
	int x,y;
	string s;
	map<string,int> m;
	map<int,string> v;
	int cnt = 0;
	while(pagezero >> x >> s){
		if('0' <=  s[1] && s[1] <= '9')continue;
		m[s] = x;
		v[x] = s;
	
		//if(++cnt % 100000 == 0)cout << cnt << endl;
	}
	pagezero.close();
	cnt = 0;
	ifstream sortedlinks("sortedlinks.txt");
	ifstream ysortedlinks("ysortedlinks.txt");
	int prev = -1,v_cnt = 0,e_cnt = 0;
	while(sortedlinks >> x >> y){
		if(++cnt % 1000000 == 0)cout << cnt << "$" << endl;
		if(x != prev)Vnext[prev] = e_cnt,prev = x,V[x] = e_cnt,v_cnt++;
		E[e_cnt] = y,e_cnt++;
	}
	cnt = 0;
	prev = -1,v_cnt = 0,e_cnt = 0;
	while(ysortedlinks >> x >> y){
		if(++cnt % 1000000 == 0)cout << cnt << "#" << endl;
		if(y != prev)Vynext[prev] = e_cnt,prev = y,Vy[y] = e_cnt,v_cnt++;
		Ey[e_cnt] = x,e_cnt++;
	}
	sortedlinks.close();
	ysortedlinks.close();

	while(cin >> word){
		word = "\'" + word + "\'";
		if(m.find(word) == m.end()){
			cout << "word not found" << endl;
			return 0;
		}
		cout << m[word] << endl;
		vector<int> wlist;
		//cout << Vy[m[word]] << "," << Vynext[m[word]] << endl;
		for(int i = Vy[m[word]];i < Vynext[m[word]];i++){
			wlist.push_back(Ey[i]);
		}
		map<int, int> cnt_word;
		for(int i = 0;i < wlist.size();i++){
			for(int j = V[wlist[i]];j < Vnext[wlist[i]];j++){
				if(cnt_word.find(E[j]) != cnt_word.end()){
					cnt_word[E[j]]++;
				}
				else cnt_word[E[j]] = 1;
			}
		}

		vector<pair<int,int> > sortvec;
		for(map<int,int>::iterator it = cnt_word.begin();it != cnt_word.end();it++){
			sortvec.push_back(make_pair(it->second,it->first));
		}

		sort(sortvec.begin(),sortvec.end());
		reverse(sortvec.begin(),sortvec.end());

		for(int i = 0;i < sortvec.size() && i < 50;i++){
			cout << sortvec[i].first << " " << sortvec[i].second << ":" << v[sortvec[i].second] << endl;
		}
	}

}
