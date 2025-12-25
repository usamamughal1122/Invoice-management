import { Component, OnInit } from '@angular/core';
import { Language, LanguageTopic, QuestionCount, QuestionItem } from '../../interface-interview';
import { InterviewService } from '../../services/interview.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-interview',
  templateUrl: './interview.component.html',
  imports: [CommonModule,FormsModule],
  styleUrls: ['./interview.component.css']
})
export class InterviewComponent implements OnInit {

  languages: Language[] = [];
  topics: LanguageTopic[] = [];
  questions: QuestionItem[] = [];
  questionCount: QuestionCount[] = [];
  selectedLanguageId?: number;
  selectedTopicId?: number;

  loadingLanguages = false;
  loadingTopics = false;
  loadingQuestions = false;
  errorMessage = '';

  constructor(private svc: InterviewService, private router: Router) {}

  ngOnInit(): void {
    this.loadLanguages();
    this.loadQuestionCountByLanguage();
  }

  loadLanguages() {
    this.loadingLanguages = true;
    this.svc.getAllLanguages().subscribe(res => {
      this.loadingLanguages = false;
      if (res.result) 
        this.languages = res.data;
      else this.errorMessage = res.message || 'Failed to load Languages';
    });
  }

 onSelectLanguage(lang: Language) {
  this.selectedLanguageId = lang.languageId;
  this.loadTopicsByLanguage(lang.languageId); 
}


loadTopicsByLanguage(languageId: number) {
  this.loadingTopics = true;
  this.svc.getLanguageTopics().subscribe(res => {
    this.loadingTopics = false;
     
    if (res.result) {
      // Filter topics that belong to this language

      this.topics = res.data.filter((t: LanguageTopic) => t.languageId === languageId);
    } else {
      this.errorMessage = res.message || 'Failed to load topics';
    }
  });
}


 onSelectTopic(topic: LanguageTopic) {
  this.selectedTopicId = topic.languageTopicId;
  this.loadQuestionsByTopic(topic.languageTopicId); 

}

loadQuestionsByTopic(topicId: number) {
  this.loadingQuestions = true;
  this.svc.getQuestionsByTopicId(topicId).subscribe(res => {
    this.loadingQuestions = false;
    if (res.result) {
       
      this.questions = res.data;
    } else {
      this.questions = [];
      this.errorMessage = res.message || 'No questions found for this topic';
    }
  });
}


  loadAllQuestions() {
    this.loadingQuestions = true;
    this.svc.getAllQuestions().subscribe(res => {
      this.loadingQuestions = false;
      if (res.result) 
        this.questions = res.data;
    });
  }


  loadQuestionCountByLanguage(){
    this.loadingQuestions = true;
    this.svc.getQuestionCountByLanguage().subscribe({
      next:res=>{
        this.loadingQuestions = false;
        if(res.result)
       this.questionCount = res.data;
      },
      error:err=>console.log(err)
    })
  }
  getQuestionCount(languageId: number): number {
    const found = this.questionCount?.find(q => q.languageId === languageId);
    return found ? found.questionCount : 0;
  }
  onAboutClick(){
    console.log('About clicked');
  }

    sessionNavigate(){
    this.router.navigate(['/sessions']);
  }
}
